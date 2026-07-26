import { Errors } from "../../core/mod.ts";

const errorKeys = new Set(Object.values(Errors));

function span(match: string, className: string, extraStyle = "") {
  const style = extraStyle ? ` style="${extraStyle}"` : "";
  return `<span class="${className}"${style}>${match}</span>`;
}

function classify(match: string): string {
  if (/^"/.test(match)) {
    if (/:$/.test(match)) {
      const key = match.replace(/"|\s*:$/g, "");
      return span(match, "key", errorKeys.has(key) ? "background-color: maroon;" : "");
    }
    return span(match, "string");
  }
  if (/true|false/.test(match)) return span(match, "boolean");
  if (/null/.test(match)) return span(match, "null");
  return span(match, "number");
}

export const highlight = (input: string) => {
  let json;
  try {
    json = typeof input !== "string" ? JSON.stringify(input, null, 2) : input;
  } catch (error) {
    return `<span class="error">Invalid JSON : ${error}</span>`;
  }

  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const regex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  return json.replace(regex, (match) => classify(match));
};
