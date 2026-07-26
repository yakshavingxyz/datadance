// Copyright (c) 2024-Present The Yak Shaving Devs, MIT License

import { withString } from "../../type_helpers.ts";
import { isRegExpExpression } from "../../utils.ts";

export const UPPER = (val: string) => withString(val, "upper", (s) => s.toUpperCase());

export const LOWER = (val: string) => withString(val, "lower", (s) => s.toLowerCase());

export const CAPITALIZE = (val: string) =>
  withString(val, "capitalize", (s) => s[0].toUpperCase() + s.slice(1));

export const SWAP_CASE = (val: string) =>
  withString(val, "swapCase", (s) =>
    s
      .split("")
      .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
      .join("")
  );

export const STARTS_WITH = (val: string, char: string) =>
  withString(val, "startsWith", (s) => s.startsWith(char));

export const ENDS_WITH = (val: string, char: string) =>
  withString(val, "endsWith", (s) => s.endsWith(char));

export const INDEX_OF_CHAR = (val: string, char: string) =>
  withString(val, "indexOfChar", (s) => s.indexOf(char));

export const TRIM = (val: string) => withString(val, "trim", (s) => s.trim());

export const LTRIM = (val: string) => withString(val, "ltrim", (s) => s.trimStart());

export const RTRIM = (val: string) => withString(val, "rtrim", (s) => s.trimEnd());

export const LENGTH = (val: string) => withString(val, "length", (s) => s.length);

export const REPLACE = (val: string, searchValue: string, replacementString: string) =>
  withString(val, "replace", (s) => {
    const searchParam: string | RegExp = isRegExpExpression(searchValue)
      ? new RegExp(searchValue)
      : searchValue;
    return s.replace(searchParam, replacementString);
  });

export const REPLACE_ALL = (val: string, searchValue: string, replacementString: string) =>
  withString(val, "replaceAll", (s) => {
    const searchParam: string | RegExp = isRegExpExpression(searchValue)
      ? new RegExp(searchValue, "g")
      : searchValue;
    return s.replaceAll(searchParam, replacementString);
  });

export const SPLIT = (val: string, delimiter: string) =>
  withString(val, "split", (s) => {
    const delimiterParam: string | RegExp = isRegExpExpression(delimiter)
      ? new RegExp(delimiter)
      : delimiter;
    return s.split(delimiterParam);
  });

export const SUBSTRING = (val: string, startIndex: number, endIndex: number) =>
  withString(val, "substring", (s) => s.substring(startIndex, endIndex));

export const PAD_START = (val: string, stringLength: number, padWith: string) =>
  withString(val, "padStart", (s) => s.padStart(stringLength, padWith));

export const PAD_END = (val: string, stringLength: number, padWith: string) =>
  withString(val, "padEnd", (s) => s.padEnd(stringLength, padWith));

export const PARSE_INT = (val: string, radix: number = 10) =>
  withString(val, "parseInt", (s) => parseInt(s, radix));

export const PARSE_FLOAT = (val: string) => withString(val, "parseFloat", (s) => parseFloat(s));

export const TO_BOOLEAN = (val: string) =>
  withString(val, "toBoolean", (s) => s === "true" ? true : false);

export const REVERSE = (val: string) =>
  withString(val, "reverse", (s) => s.split("").reverse().join(""));

export const SLUGIFY = (val: string) => withString(val, "slugify", (s) => encodeURI(s));

export const UNSLUGIFY = (val: string) => withString(val, "unslugify", (s) => decodeURI(s));
