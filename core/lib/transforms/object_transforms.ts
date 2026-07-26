// Copyright (c) 2024-Present The Yak Shaving Devs, MIT License

import { withObject, withObjectOrArray } from "../../type_helpers.ts";
import { PlainObject } from "../../types.ts";
import { isObject, symmetricDifference } from "../../utils.ts";

export const GET = (val: Record<string, any>, property: string) =>
  withObject(val, "get", (obj) => obj?.[property] ?? null);

export const KEYS = (val: object) => withObject(val, "keys", (obj) => Object.keys(obj));

export const VALUES = (val: object) => withObject(val, "values", (obj) => Object.values(obj));

export const ENTRIES = (val: object) => withObject(val, "entries", (obj) => Object.entries(obj));

export const HAS = (val: object, property: string) =>
  withObject(val, "has", (obj) => Object.hasOwn(obj, property));

export const DELETE = (val: Record<string, any>, properties: Array<string>) =>
  withObject(val, "delete", (obj) => {
    const propertiesToKeep = symmetricDifference(
      new Set(Object.keys(obj)),
      new Set(properties)
    );
    const result: Record<string, any> = {};
    propertiesToKeep.forEach((prop) => {
      result[prop] = obj[prop];
    });
    return result;
  });

export const STRINGIFY = (val: object) =>
  withObjectOrArray(val, "stringify", (obj) => JSON.stringify(obj));

export const DEEP_MERGE = <T extends PlainObject, U extends PlainObject>(
  val: T,
  objectToMerge: U
): T & U => {
  if (!isObject(val)) return objectToMerge as T & U;
  if (!isObject(objectToMerge)) return val as T & U;

  const merged: PlainObject = { ...val };

  for (const key in objectToMerge) {
    if (Object.prototype.hasOwnProperty.call(objectToMerge, key)) {
      const valProp = merged[key];
      const mergeProp = objectToMerge[key];

      if (isObject(valProp) && isObject(mergeProp)) {
        merged[key] = DEEP_MERGE(valProp, mergeProp);
      } else {
        merged[key] = mergeProp;
      }
    }
  }

  return merged as T & U;
};
