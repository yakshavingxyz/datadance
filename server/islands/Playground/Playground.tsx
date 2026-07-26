import { useEffect, useRef, useState } from "preact/hooks";
import AceEditor from "ace-builds";
import ace from "ace-builds";
import Dracula from "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";
import { transform, ddsToJson } from "../../../core/mod.ts";
import type { DataObject, MergeMethod, SerialOperations } from "../../../core/mod.ts";
import { highlight } from "../../utils/highlight_json.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";

ace.config.set("basePath", "https://esm.sh/ace-builds@1.35.4/src-noconflict");
ace.config.setModuleUrl(
  "ace/mode/yaml",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-noconflict/mode-yaml.js"
);

const sampleInput = `{
  "name": {
      "first": " malory",
      "last": "archer"
  },
  "exes": [
      " Nikolai Jakov ",
      "Len Trexler",
      "Burt Reynolds"
  ],
  "lastEx": 2
}`;

const sampleTransforms = `lastEx : derived.lastEx + 5
modified : derived.lastEx
original : input.lastEx
nameObject :
  name : input.name.first | trim + ' ' + input.name.last
  name : derived.nameObject.name | capitalize
  age : 25
  ex1 : '=>' + input.exes[0] | rtrim 
isMinor : derived.nameObject.age < 18
nameLength : derived.nameObject.name | length
nameUpper : derived.nameObject.name | upper`;

const getLocalStorageItem = (key: string) => {
  if (IS_BROWSER) {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorageItem = (key: string, value: any) => {
  if (IS_BROWSER) {
    return localStorage.setItem(key, value);
  }
  return null;
};

const removeLocalStorageItem = (key: string) => {
  if (IS_BROWSER) {
    localStorage.removeItem(key);
  }
};

const Playground = () => {
  const [input, setInput] = useState<string>(
    getLocalStorageItem("input") || sampleInput
  );
  const [transforms, setTransforms] = useState<string>(
    getLocalStorageItem("transforms") || sampleTransforms
  );
  const [output, setOutput] = useState<string>("");
  const [mergeMethod, setMergeMethod] = useState<MergeMethod>(
    getLocalStorageItem("mergeMethod") as MergeMethod || "overwrite"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const transformsRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const editorRef = useRef<typeof AceEditor | null>(null);

  const throttle = <T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let lastFunc: ReturnType<typeof setTimeout>;
    let lastRan: number;

    return function (...args: Parameters<T>) {
      if (!lastRan) {
        func(...args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  useEffect(() => {
    try {
      const initializeEditor = () => {
        const editor = AceEditor.edit(transformsRef.current);
        editor.setOptions({
          enableAutoIndent: true,
          maxLines: 15,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          fontSize: "12pt",
          showFoldWidgets: true,
          tabSize: 2,
        });
        editor.setTheme(Dracula);
        editor.setValue(transforms, -1);
        ace.config.loadModule("ace/mode/yaml", (yamlMode: any) => {
          editor.session.setMode(new yamlMode.Mode());
        });
        editor.session.on("change", () => {
          const newTransforms = editor.getValue();
          setTransforms(newTransforms);
          handleTransform(newTransforms);
        });

        editorRef.current = editor;
        return editor;
      };

      const handleTransform = throttle((transforms: string) => {
        const dataObject: DataObject = {
          input: JSON.parse(input),
          transforms: parseTransformsHelper(transforms),
          settings: {
            merge_method: mergeMethod,
          },
        };

        transform(dataObject)
          .then((transformedOutput) => {
            setOutput(JSON.stringify(transformedOutput, null, 2));
          })
          .catch((error) => {
            setErrorMessage(`Invalid Transforms : ${error}`);
          });
      }, 1000);

      if (transformsRef.current) {
        const editor = initializeEditor();
        handleTransform(transforms);

        return () => editor.destroy();
      }
    } catch (error) {
      console.error(`There was an error while updating output JSON : ${error}`);
    }
  }, [input, mergeMethod]);

  useEffect(() => {
    try {
      if (outputRef.current) {
        outputRef.current.innerHTML = highlight(output);
      }
    } catch (error) {
      console.error(
        `There was an error while updating the output element HTML :${error}`
      );
    }
  }, [output]);

  useEffect(() => {
    setLocalStorageItem("input", input);
  }, [input]);

  useEffect(() => {
    setLocalStorageItem("transforms", transforms);
  }, [transforms]);

  useEffect(() => {
    setLocalStorageItem("mergeMethod", mergeMethod);
  }, [mergeMethod]);

  const parseTransformsHelper = (transforms: string): SerialOperations => {
    const result = ddsToJson(transforms);
    if (result.length === 1 && Object.keys(result[0])[0] === "error") {
      setErrorMessage(result[0]["error"].toString());
    } else {
      setErrorMessage("");
    }
    return result;
  };

  function handleInputChange(event: any) {
    setInput(event.target.value);
  }

  function handleMergeMethodChange(event: any) {
    setMergeMethod(event.target.value);
  }

  function handleCopyTransforms(event: any) {
    try {
      navigator.clipboard.writeText(
        JSON.stringify(ddsToJson(transforms), null, 2)
      );
    } catch (error) {
      console.log(
        `Error while copying parsed transforms to clipboard : ${error}.`
      );
    }
  }

  function handleReset(event: any) {
    removeLocalStorageItem("input");
    removeLocalStorageItem("transforms");
    removeLocalStorageItem("mergeMethod");

    setMergeMethod("overwrite");
    setInput(sampleInput);
    setTransforms(sampleTransforms);

    if (editorRef.current) {
      editorRef.current.setValue(sampleTransforms, -1);
    }
  }

  return (
    <div class="container">
      <br>
        <br></br>
      </br>
      <div class="row gx-4 gy-4">
        <div class="col-md-6">
          <div class="mb-3">
            <div class="form-floating">
              <textarea
                class="form-control"
                value={input}
                onInput={handleInputChange}
                id="inputJson"
                style={{
                  overflow: "scroll",
                  resize: "none",
                  maxHeight: "30em",
                  height: "20em",
                }}
              />
              <label for="inputJson" class="text-primary">Input JSON</label>
            </div>
          </div>
          <div>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <div>
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="radio"
                  id="overwrite"
                  value="overwrite"
                  name="merge_method"
                  onChange={handleMergeMethodChange}
                  checked={mergeMethod === "overwrite"}
                />
                <label class="form-check-label" for="overwrite">
                  Overwrite
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="radio"
                  id="transforms_only"
                  value="transforms_only"
                  name="merge_method"
                  onChange={handleMergeMethodChange}
                  checked={mergeMethod === "transforms_only"}
                />
                <label class="form-check-label" for="transforms_only">
                  Transforms only
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input
                  class="form-check-input"
                  type="radio"
                  id="preserve"
                  value="preserve"
                  name="merge_method"
                  onChange={handleMergeMethodChange}
                  checked={mergeMethod === "preserve"}
                />
                <label class="form-check-label" for="preserve">
                  Preserve
                </label>
              </div>
            </div>
          </div>
          <br />
          <div>
            <div>
              <div
                class="modal fade"
                id="copyTransformsModal"
                aria-labelledby="copyTransformsModalLabel"
                aria-hidden="true"
              >
                <div class="modal-dialog">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h1
                        class="modal-title fs-5"
                        id="copyTransformsModalLabel"
                      >
                        Datadance
                      </h1>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div class="modal-body">
                      The transforms output is successfully copied to clipboard.
                      You can use <code>/api/saveTransform</code> endpoint to
                      save these transformations and then use{" "}
                      <code>/api/run</code> to run these transformations on
                      other inputs.
                    </div>
                    <div class="modal-footer">
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        data-bs-dismiss="modal"
                        style={{ color: "white" }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card h-100">
              <h6 class="card-header">
                Transforms&nbsp;&nbsp;&nbsp;&nbsp;
                <button
                  id="copyTransformsButton"
                  class="btn btn-sm btn-outline-secondary"
                  onClick={handleCopyTransforms}
                  style={{ color: "white" }}
                  data-bs-toggle="modal"
                  data-bs-target="#copyTransformsModal"
                  title="Copies the parsed JSON transforms onto clipboard"
                >
                  Copy parsed transforms
                </button>
                &nbsp;&nbsp;
                <button
                  id="reset"
                  class="btn btn-sm btn-outline-secondary"
                  onClick={handleReset}
                  style={{ color: "white" }}
                  title="Resets the playground to use default example"
                >
                  Reset
                </button>
              </h6>

              <div class="card-body" ref={transformsRef} />
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div
            class="card h-100"
            style={{ maxHeight: "44em", overflow: "auto" }}
          >
            <h6 class="card-header">Output</h6>
            <div class="card-body overflow-auto">
              <div class="output">
                <pre ref={outputRef}>{output}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
