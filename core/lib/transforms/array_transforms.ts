import { withArray, withClonedArray, typeError } from "../../type_helpers.ts";

export const PLUCK = (val: Array<any>, properties: Array<String>) =>
  withArray(val, "pluck", (arr) => {
    const justOneProperty = properties.length === 1;
    return arr.map((item: Record<string, any>) => {
      const picked: Record<string, any> = {};
      properties.forEach((prop) => {
        picked[prop] = item[prop];
      });
      return justOneProperty ? Object.values(picked)[0] : picked;
    });
  });

export const SIZE = (val: Array<any> | object | string) => {
  if (typeof val === "string") return val.length;
  if (typeof val === "object") {
    if (Array.isArray(val)) return val.length;
    return Object.keys(val).length;
  }
  return typeError(val, "size", "Object, String, or Array");
};

export const PUSH = (val: Array<any>, item: any) =>
  withClonedArray(val, "push", (arr) => {
    arr.push(...item);
    return arr;
  });

export const POP = (val: Array<any>) =>
  withClonedArray(val, "pop", (arr) => {
    arr.pop();
    return arr;
  });

export const JOIN = (val: Array<any>, delimiter: any) =>
  withArray(val, "join", (arr) => arr.join(delimiter));

export const SLICE = (val: Array<any>, startIdx: number, endIdx: number) =>
  withArray(val, "slice", (arr) => arr.slice(startIdx, endIdx));

export const REVERSE_ARRAY = (val: Array<any>) =>
  withClonedArray(val, "reverseArray", (arr) => {
    arr.reverse();
    return arr;
  });

export const SORT_ARRAY = (val: Array<any>) =>
  withClonedArray(val, "sortArray", (arr) => {
    arr.sort();
    return arr;
  });

export const RANGE = (_val: null = null, start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

export const RANGE_RIGHT = (_val: null = null, start: number, stop: number, step: number) =>
  Array.from({ length: (start - stop) / step + 1 }, (_, i) => start - i * Math.abs(step));

export const REMOVE_DUPLICATES = (val: Array<any>) =>
  withClonedArray(val, "removeDuplicates", (arr) => [...new Set(arr)]);

export const MAX = (val: Array<number>) =>
  withArray(val, "max", (arr) =>
    arr.reduce((max, n) => (typeof n === "number" && n > max ? n : max), -Infinity)
  );

export const MIN = (val: Array<number>) =>
  withArray(val, "min", (arr) =>
    arr.reduce((min, n) => (typeof n === "number" && n < min ? n : min), Infinity)
  );
