import mozjexl from "./custom_transforms.ts";

import { DataObject, ErrorObject, Expression } from "../types.ts";
import { errors } from "../constants/constants.ts";

const transform = async (
  dataObject: DataObject,
): Promise<Record<string, any> | ErrorObject> => {
  try {
    const { input, transforms, settings } = dataObject;

    const derived: Record<string, any> = dataObject.derived !== undefined
      ? dataObject.derived
      : { ...input };

    const pathTrace: Array<string> = dataObject.pathTrace !== undefined
      ? dataObject.pathTrace
      : [];

    const isSubTransformation: boolean =
      dataObject.isSubTransformation !== undefined
        ? dataObject.isSubTransformation
        : false;

    const transformedOutput: Record<string, any> = {};

    const dataObjectClone = structuredClone(dataObject);
    dataObjectClone.settings.merge_method = "transforms_only";
    dataObjectClone.derived = derived;
    dataObjectClone.pathTrace = pathTrace;
    dataObjectClone.isSubTransformation = isSubTransformation;

    for (const fieldTransformObject of transforms) {
      if (Object.keys(fieldTransformObject).length !== 1) {
        return { "error-101": "Each transform has to have only one key" };
      }

      const field: string = Object.keys(fieldTransformObject)[0];
      const expression: Expression = fieldTransformObject[field];

      try {
        if (Array.isArray(expression)) {
          let intermediateResultObject = {};
          dataObjectClone.pathTrace.push(field);
          dataObjectClone.isSubTransformation = true;
          for (
            let subTransformIndex = 0;
            subTransformIndex < expression.length;
            subTransformIndex++
          ) {
            dataObjectClone.transforms = [expression[subTransformIndex]];
            const subFieldName = Object.keys(expression[subTransformIndex])[0];
            const subResultObject = await transform(dataObjectClone);

            dataObjectClone.pathTrace.push(subFieldName);
            let subResult: Record<string, any> = {};
            Object.keys(subResultObject).some((key) => {
              if (errors.includes(key)) {
                Object.assign(subResult, {});
                subResult[subFieldName] = subResultObject;
              } else {
                subResult = { ...subResultObject };
              }
            });

            intermediateResultObject = {
              ...intermediateResultObject,
              ...subResult,
            };
            _updateDerivedState(
              dataObjectClone.derived,
              subResult,
              pathTrace,
            );

            dataObjectClone.pathTrace.pop();
          }

          transformedOutput[field] = intermediateResultObject;
          dataObjectClone.pathTrace.pop();
          dataObjectClone.isSubTransformation = false;
        } else {
          const result = await mozjexl.eval(expression, { input, derived });
          if (result === undefined) {
            return {
              "error-102":
                `The transform ${expression} uses variables not available in the context`,
            };
          }

          transformedOutput[field] = result;
          if (!isSubTransformation) derived[field] = result;
        }
      } catch (error) {
        return { "error-103": error.toString() };
      }
    }

    switch (settings.merge_method?.toLowerCase()) {
      case "overwrite":
        return { ...input, ...transformedOutput };
      case "preserve":
        return { ...input, transforms: transformedOutput };
      case "transforms_only":
        return transformedOutput;
      default:
        return { "error-104": "Invalid merge method" };
    }
  } catch (transformError) {
    return { "error-105": transformError.toString() };
  }
};

const _updateDerivedState = (
  targetObject: Record<string, any>,
  sourceObject: Record<string, any>,
  pathTrace: Array<string>,
) => {
  let currentObject = targetObject;
  pathTrace.forEach((path, index) => {
    if (index === pathTrace.length - 1) {
      currentObject[path] = sourceObject[path];
    } else {
      if (currentObject[path] === undefined) {
        currentObject[path] = {};
      }
      currentObject = currentObject[path];
    }
  });
};

export default transform;
