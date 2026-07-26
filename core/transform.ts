// Copyright (c) 2024-Present The Yak Shaving Devs, MIT License

import mozjexl from "./load_lib.ts";
import { DataObject, ErrorObject, Expression, SerialOperations } from "./types.ts";
import { Errors } from "./constants.ts";
import { ddsToJson, isDdsDataObject } from "./dds.ts";

export const transform = async (
  dataObject: DataObject
): Promise<Record<string, any> | ErrorObject> => {
  try {
    const transforms = parseTransforms(dataObject);
    const { input, settings } = dataObject;
    const derived = dataObject.derived ?? { ...input };
    const pathTrace = dataObject.pathTrace ?? [];
    const isSubTransformation = dataObject.isSubTransformation ?? false;

    const output = await evaluateTransforms(
      transforms,
      { input, derived, pathTrace, isSubTransformation },
      dataObject
    );

    return applyMergeMethod(output, input, settings.merge_method);
  } catch (error) {
    return { [Errors.TransformError]: error.toString() };
  }
};

function parseTransforms(dataObject: DataObject): SerialOperations {
  if (isDdsDataObject(dataObject)) {
    return ddsToJson(dataObject.transforms);
  }
  return dataObject.transforms;
}

interface TransformContext {
  input: Record<string, any>;
  derived: Record<string, any>;
  pathTrace: Array<string>;
  isSubTransformation: boolean;
}

async function evaluateTransforms(
  transforms: SerialOperations,
  ctx: TransformContext,
  originalDataObject: DataObject
): Promise<Record<string, any>> {
  const output: Record<string, any> = {};
  const { derived, pathTrace, isSubTransformation } = ctx;

  for (const transformEntry of transforms) {
    const keys = Object.keys(transformEntry);
    if (keys.length !== 1) {
      const errorMsg = `${Errors.InvalidTransform}: Each transform must have exactly one key`;
      console.error(`%c${errorMsg}`, "color:red");
      return { [Errors.InvalidTransform]: errorMsg };
    }

    const field = keys[0];
    const expression: Expression = transformEntry[field];

    if (isSubTransformBlock(field)) {
      derived[field] = expression;
      continue;
    }

    try {
      if (Array.isArray(expression)) {
        const nestedResult = await evaluateNestedTransforms(
          field,
          expression,
          ctx,
          originalDataObject
        );
        output[field] = nestedResult;
      } else {
        const result = await evaluateSimpleExpression(expression, ctx);
        if (!isTemporaryField(field) || pathTrace.length > 0) {
          output[field] = cleanTemporaryFieldsFromResult(result);
        }
        if (!isSubTransformation) derived[field] = result;
      }
    } catch (error) {
      handleTransformError(error, field, output, derived, isSubTransformation, pathTrace);
    }
  }

  return output;
}

async function evaluateNestedTransforms(
  parentField: string,
  expressions: SerialOperations,
  ctx: TransformContext,
  originalDataObject: DataObject
): Promise<Record<string, any>> {
  const { derived, pathTrace } = ctx;
  const dataObjectClone = structuredClone(originalDataObject);
  dataObjectClone.settings.merge_method = "transforms_only";

  pathTrace.push(parentField);

  let intermediateResult: Record<string, any> = {};

  for (const subEntry of expressions) {
    const subField = Object.keys(subEntry)[0];
    dataObjectClone.transforms = [subEntry];
    dataObjectClone.derived = derived;
    dataObjectClone.pathTrace = pathTrace;
    dataObjectClone.isSubTransformation = true;

    const subResultObject = await transform(dataObjectClone);

    pathTrace.push(subField);

    const subResult = extractSubResult(subResultObject, subField);
    intermediateResult = { ...intermediateResult, ...subResult };

    updateDerivedState(derived, subResult, pathTrace);

    pathTrace.pop();
  }

  pathTrace.pop();
  return cleanTemporaryFields(intermediateResult);
}

function extractSubResult(
  resultObject: Record<string, any>,
  subField: string
): Record<string, any> {
  const hasError = Object.keys(resultObject).some((key) =>
    Object.keys(Errors).includes(key)
  );
  if (hasError) {
    return { [subField]: resultObject };
  }
  return { ...resultObject };
}

async function evaluateSimpleExpression(
  expression: string,
  ctx: TransformContext
): Promise<any> {
  const result = await mozjexl.eval(expression, {
    input: ctx.input,
    derived: ctx.derived,
  });
  if (result === undefined || result === null) {
    const errorMsg = {
      [Errors.VariableNotInContext]:
        `The transform ${expression} uses variables not available in the context`,
    };
    console.error(`%c${Errors.VariableNotInContext} : ${expression}`, "color:red");
    return errorMsg;
  }
  return result;
}

function handleTransformError(
  error: any,
  field: string,
  output: Record<string, any>,
  derived: Record<string, any>,
  isSubTransformation: boolean,
  pathTrace: Array<string>
) {
  let formattedError = JSON.stringify(error);
  if (formattedError === "{}") {
    formattedError = "The transforms contain an incomplete/invalid expression.";
  }
  const errorResult = { [Errors.TransformError]: formattedError };
  console.error(`%c${Errors.TransformError}: ${formattedError}`, "color:red");
  if (!isTemporaryField(field) || pathTrace.length > 0) {
    output[field] = errorResult;
  }
  if (!isSubTransformation) derived[field] = errorResult;
}

function cleanTemporaryFieldsFromResult(result: any): any {
  if (typeof result === "object" && !Array.isArray(result)) {
    return cleanTemporaryFields(result);
  }
  return result;
}

function applyMergeMethod(
  transformedOutput: Record<string, any>,
  input: Record<string, any>,
  mergeMethod: string | undefined
): Record<string, any> {
  switch (mergeMethod?.toLowerCase()) {
    case "overwrite":
      return { ...input, ...transformedOutput };
    case "preserve":
      return { ...input, transforms: transformedOutput };
    case "transforms_only":
      return transformedOutput;
    default:
      return { [Errors.InvalidMergeMethod]: "Invalid merge method" };
  }
}

export const updateDerivedState = (
  targetObject: Record<string, any>,
  sourceObject: Record<string, any>,
  pathTrace: Array<string>
) => {
  let current = targetObject;
  pathTrace.forEach((path, index) => {
    if (index === pathTrace.length - 1) {
      current[path] = sourceObject[path];
    } else {
      if (current[path] === undefined) current[path] = {};
      current = current[path];
    }
  });
};

export const isTemporaryField = (fieldName: string): boolean => {
  return fieldName.startsWith("_") && !isSubTransformBlock(fieldName);
};

export const cleanTemporaryFields = (resultObject: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  for (const key in resultObject) {
    if (!isTemporaryField(key)) {
      cleaned[key] = resultObject[key];
    }
  }
  return cleaned;
};

export const isSubTransformBlock = (fieldName: string): boolean => {
  return fieldName.startsWith("_$");
};
