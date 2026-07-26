// Copyright (c) 2024-Present The Yak Shaving Devs, MIT License

// @ts-ignore "Mozjexl do not have any official or community built type definitions"
import mozjexl from "mozjexl";
import { Errors } from "./constants.ts";
import { withString } from "./type_helpers.ts";

import {
  CAPITALIZE, ENDS_WITH, INDEX_OF_CHAR, LENGTH, LOWER, LTRIM,
  PAD_END, PAD_START, PARSE_FLOAT, PARSE_INT, REPLACE, REPLACE_ALL,
  REVERSE, RTRIM, SLUGIFY, SPLIT, STARTS_WITH, SUBSTRING, SWAP_CASE,
  TO_BOOLEAN, TRIM, UNSLUGIFY, UPPER,
} from "./lib/transforms/string_transforms.ts";

import {
  FOREACH, JSONPATH, PARSE_JSON, TYPE, UUID,
} from "./lib/transforms/misc_transforms.ts";

import {
  JOIN, MAX, MIN, PLUCK, POP, PUSH, RANGE, RANGE_RIGHT,
  REMOVE_DUPLICATES, REVERSE_ARRAY, SIZE, SLICE, SORT_ARRAY,
} from "./lib/transforms/array_transforms.ts";

import {
  DELETE, DEEP_MERGE, ENTRIES, GET, HAS, KEYS, STRINGIFY, VALUES,
} from "./lib/transforms/object_transforms.ts";

import {
  ABS, CEIL, FLOOR, RANDOM, ROUND,
} from "./lib/transforms/number_transforms.ts";

import {
  CONVERT_DATE_TIME_FORMAT, FORMAT_DATE_TIME, GET_DAY, GET_HOURS,
  GET_MINUTES, GET_MONTH, GET_SECONDS, GET_TIME_ZONE, GET_YEAR,
  NOW, SET_DAY, SET_HOURS, SET_MINUTES, SET_MONTH, SET_SECONDS,
  SET_TIME_ZONE, SET_YEAR, TO_LOCAL, TO_MILLIS, TO_UTC, UTC_NOW,
} from "./lib/transforms/date_transforms.ts";

import { EQUALS_IGNORE_CASE, STRICT_EQUALS } from "./lib/operators/custom_operators.ts";

// Register custom operators
mozjexl.addBinaryOp("_=", 20, EQUALS_IGNORE_CASE);
mozjexl.addBinaryOp("===", 20, STRICT_EQUALS);

// Register all transforms using a data-driven approach
const TRANSFORMS: [string, any][] = [
  // String
  ["upper", UPPER], ["lower", LOWER], ["capitalize", CAPITALIZE],
  ["swapCase", SWAP_CASE], ["startsWith", STARTS_WITH], ["endsWith", ENDS_WITH],
  ["indexOfChar", INDEX_OF_CHAR], ["trim", TRIM], ["ltrim", LTRIM],
  ["rtrim", RTRIM], ["length", LENGTH], ["replace", REPLACE],
  ["replaceAll", REPLACE_ALL], ["split", SPLIT], ["substring", SUBSTRING],
  ["padStart", PAD_START], ["padEnd", PAD_END], ["parseInt", PARSE_INT],
  ["parseFloat", PARSE_FLOAT], ["toBoolean", TO_BOOLEAN], ["reverse", REVERSE],
  ["slugify", SLUGIFY], ["unslugify", UNSLUGIFY],
  // Misc
  ["forEach", FOREACH], ["jsonpath", JSONPATH], ["type", TYPE],
  ["parseJson", PARSE_JSON], ["UUID", UUID],
  // Array
  ["pluck", PLUCK], ["size", SIZE], ["push", PUSH], ["pop", POP],
  ["join", JOIN], ["slice", SLICE], ["reverseArray", REVERSE_ARRAY],
  ["sortArray", SORT_ARRAY], ["range", RANGE], ["rangeRight", RANGE_RIGHT],
  ["removeDuplicates", REMOVE_DUPLICATES], ["max", MAX], ["min", MIN],
  // Object
  ["keys", KEYS], ["values", VALUES], ["entries", ENTRIES], ["get", GET],
  ["has", HAS], ["delete", DELETE], ["stringify", STRINGIFY],
  ["deepMerge", DEEP_MERGE],
  // Number
  ["abs", ABS], ["ceil", CEIL], ["floor", FLOOR], ["round", ROUND],
  ["random", RANDOM],
  // Date
  ["formatDateTime", FORMAT_DATE_TIME], ["convertDateTimeFormat", CONVERT_DATE_TIME_FORMAT],
  ["now", NOW], ["utcNow", UTC_NOW], ["toUTC", TO_UTC], ["toLocal", TO_LOCAL],
  ["toMillis", TO_MILLIS], ["getSeconds", GET_SECONDS], ["getTimeZone", GET_TIME_ZONE],
  ["getMinutes", GET_MINUTES], ["getHours", GET_HOURS], ["getDay", GET_DAY],
  ["getMonth", GET_MONTH], ["getYear", GET_YEAR], ["setSeconds", SET_SECONDS],
  ["setTimeZone", SET_TIME_ZONE], ["setMinutes", SET_MINUTES], ["setHours", SET_HOURS],
  ["setDay", SET_DAY], ["setMonth", SET_MONTH], ["setYear", SET_YEAR],
];

for (const [name, fn] of TRANSFORMS) {
  mozjexl.addTransform(name, fn);
}

// evaluateExpression must be registered last since it depends on all other transforms
const EVALUATE_EXPRESSION = async (val: string, context: Record<any, any>) =>
  withString(val, "evaluateExpression", async (s) => {
    const regex = /{{\s*(.+?)\s*}}/g;
    const parts = s.split(regex);
    for (let i = 1; i < parts.length; i += 2) {
      const result = await mozjexl.eval(parts[i], context);
      parts[i] = typeof result === "string" ? result : JSON.stringify(result);
    }
    return parts.join("");
  });

mozjexl.addTransform("evaluateExpression", EVALUATE_EXPRESSION);

export default mozjexl;
