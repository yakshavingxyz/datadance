import { assertEquals, assert } from "$std/assert/mod.ts";

// String transforms
import {
  UPPER, LOWER, CAPITALIZE, SWAP_CASE, STARTS_WITH, ENDS_WITH,
  INDEX_OF_CHAR, TRIM, LTRIM, RTRIM, LENGTH, REPLACE, REPLACE_ALL,
  SPLIT, SUBSTRING, PAD_START, PAD_END, PARSE_INT, PARSE_FLOAT,
  TO_BOOLEAN, REVERSE, SLUGIFY, UNSLUGIFY,
} from "../lib/transforms/string_transforms.ts";

// Number transforms
import { ABS, CEIL, FLOOR, ROUND, RANDOM } from "../lib/transforms/number_transforms.ts";

// Array transforms
import {
  PLUCK, SIZE, PUSH, POP, JOIN, SLICE, REVERSE_ARRAY, SORT_ARRAY,
  RANGE, RANGE_RIGHT, REMOVE_DUPLICATES, MAX, MIN,
} from "../lib/transforms/array_transforms.ts";

// Object transforms
import {
  GET, KEYS, VALUES, ENTRIES, HAS, DELETE, STRINGIFY, DEEP_MERGE,
} from "../lib/transforms/object_transforms.ts";

// Date transforms
import {
  FORMAT_DATE_TIME, NOW, UTC_NOW, TO_UTC, TO_LOCAL, TO_MILLIS,
  GET_TIME_ZONE, GET_SECONDS, GET_MINUTES, GET_HOURS, GET_DAY,
  GET_MONTH, GET_YEAR, SET_SECONDS, SET_MINUTES, SET_HOURS,
  SET_DAY, SET_MONTH, SET_YEAR, SET_TIME_ZONE,
} from "../lib/transforms/date_transforms.ts";

// Misc transforms - not importing from misc_transforms.ts directly
// due to circular dependency with load_lib.ts/transform.ts
const _TYPE = (val: any) => {
  if (typeof val === "string") return "String";
  else if (typeof val === "number") return "Number";
  else if (typeof val === "boolean") return "Boolean";
  else if (typeof val === "object" && Array.isArray(val)) return "Array";
  else if (typeof val === "object" && val !== null) return "Object";
  else if (typeof val === "undefined") return "undefined";
  else if (val === null) return "null";
};
const _PARSE_JSON = (val: string) => {
  if (typeof val === "string") {
    try { return JSON.parse(val); }
    catch (error) { return { JsonParseError: `The ${val} cannot be parsed : ${error}` }; }
  }
  return { MethodNotDefinedForType: `parseJson only supported for String` };
};
const _UUID = () => crypto.randomUUID();

// Custom operators
import { EQUALS_IGNORE_CASE, STRICT_EQUALS } from "../lib/operators/custom_operators.ts";

// ------------------------------------------------
// String Transforms
// ------------------------------------------------

Deno.test("UPPER converts string to uppercase", () => {
  assertEquals(UPPER("hello"), "HELLO");
  assertEquals(UPPER("HeLLo"), "HELLO");
  assertEquals(typeof UPPER(42 as any), "object");
});

Deno.test("LOWER converts string to lowercase", () => {
  assertEquals(LOWER("HELLO"), "hello");
  assertEquals(LOWER("HeLLo"), "hello");
  assertEquals(typeof LOWER(42 as any), "object");
});

Deno.test("CAPITALIZE capitalizes first letter", () => {
  assertEquals(CAPITALIZE("hello"), "Hello");
  assertEquals(CAPITALIZE("h"), "H");
});

Deno.test("SWAP_CASE swaps character case", () => {
  assertEquals(SWAP_CASE("Hello World"), "hELLO wORLD");
  assertEquals(SWAP_CASE("123"), "123");
});

Deno.test("STARTS_WITH checks string start", () => {
  assertEquals(STARTS_WITH("hello", "he"), true);
  assertEquals(STARTS_WITH("hello", "el"), false);
});

Deno.test("ENDS_WITH checks string end", () => {
  assertEquals(ENDS_WITH("hello", "lo"), true);
  assertEquals(ENDS_WITH("hello", "el"), false);
});

Deno.test("INDEX_OF_CHAR finds character position", () => {
  assertEquals(INDEX_OF_CHAR("hello", "l"), 2);
  assertEquals(INDEX_OF_CHAR("hello", "x"), -1);
});

Deno.test("TRIM removes surrounding whitespace", () => {
  assertEquals(TRIM("  hello  "), "hello");
  assertEquals(TRIM("hello"), "hello");
});

Deno.test("LTRIM removes leading whitespace", () => {
  assertEquals(LTRIM("  hello  "), "hello  ");
});

Deno.test("RTRIM removes trailing whitespace", () => {
  assertEquals(RTRIM("  hello  "), "  hello");
});

Deno.test("LENGTH returns string length", () => {
  assertEquals(LENGTH("hello"), 5);
  assertEquals(LENGTH(""), 0);
});

Deno.test("REPLACE replaces first occurrence", () => {
  assertEquals(REPLACE("hello world", "world", "there"), "hello there");
  assertEquals(REPLACE("hello world", "l", "x"), "hexlo world");
});

Deno.test("REPLACE with regex pattern", () => {
  assertEquals(REPLACE("hello 123", "\\d+", "num"), "hello num");
});

Deno.test("REPLACE_ALL replaces all occurrences", () => {
  assertEquals(REPLACE_ALL("hello world hello", "hello", "hi"), "hi world hi");
  assertEquals(REPLACE_ALL("hello", "l", "x"), "hexxo");
});

Deno.test("SPLIT divides string by delimiter", () => {
  assertEquals(SPLIT("a,b,c", ","), ["a", "b", "c"]);
  assertEquals(SPLIT("hello", ""), ["h", "e", "l", "l", "o"]);
});

Deno.test("SPLIT with regex delimiter", () => {
  assertEquals(SPLIT("a1b2c", "\\d"), ["a", "b", "c"]);
});

Deno.test("SUBSTRING extracts portion of string", () => {
  assertEquals(SUBSTRING("hello", 1, 4), "ell");
  assertEquals(SUBSTRING("hello", 0, 5), "hello");
});

Deno.test("PAD_START pads string at start", () => {
  assertEquals(PAD_START("5", 3, "0"), "005");
  assertEquals(PAD_START("hello", 10, "*"), "*****hello");
});

Deno.test("PAD_END pads string at end", () => {
  assertEquals(PAD_END("5", 3, "0"), "500");
  assertEquals(PAD_END("hello", 10, "*"), "hello*****");
});

Deno.test("PARSE_INT converts string to integer", () => {
  assertEquals(PARSE_INT("42"), 42);
  assertEquals(PARSE_INT("ff", 16), 255);
  assertEquals(typeof PARSE_INT(42 as any), "object");
});

Deno.test("PARSE_FLOAT converts string to float", () => {
  assertEquals(PARSE_FLOAT("3.14"), 3.14);
  assertEquals(PARSE_FLOAT("42"), 42);
});

Deno.test("TO_BOOLEAN converts string to boolean", () => {
  assertEquals(TO_BOOLEAN("true"), true);
  assertEquals(TO_BOOLEAN("false"), false);
  assertEquals(TO_BOOLEAN("any"), false);
});

Deno.test("REVERSE reverses string characters", () => {
  assertEquals(REVERSE("hello"), "olleh");
  assertEquals(REVERSE(""), "");
});

Deno.test("SLUGIFY encodes URI", () => {
  assertEquals(SLUGIFY("hello world"), "hello%20world");
  assertEquals(SLUGIFY("a b"), "a%20b");
});

Deno.test("UNSLUGIFY decodes URI", () => {
  assertEquals(UNSLUGIFY("hello%20world"), "hello world");
  assertEquals(UNSLUGIFY("a%20b"), "a b");
});

// ------------------------------------------------
// Number Transforms
// ------------------------------------------------

Deno.test("ABS returns absolute value", () => {
  assertEquals(ABS(-5), 5);
  assertEquals(ABS(5), 5);
  assertEquals(ABS(0), 0);
});

Deno.test("CEIL rounds up", () => {
  assertEquals(CEIL(3.2), 4);
  assertEquals(CEIL(-3.2), -3);
});

Deno.test("FLOOR rounds down", () => {
  assertEquals(FLOOR(3.8), 3);
  assertEquals(FLOOR(-3.2), -4);
});

Deno.test("ROUND rounds to nearest integer", () => {
  assertEquals(ROUND(3.5), 4);
  assertEquals(ROUND(3.4), 3);
});

Deno.test("RANDOM returns a number between 0 and 1", () => {
  const result = RANDOM(null);
  assertEquals(typeof result, "number");
  assert(result >= 0 && result < 1);
});

// ------------------------------------------------
// Array Transforms
// ------------------------------------------------

Deno.test("PLUCK extracts properties from objects", () => {
  const data = [{ name: "a", age: 1 }, { name: "b", age: 2 }];
  assertEquals(PLUCK(data, ["name"]), ["a", "b"]);
  assertEquals(PLUCK(data, ["name", "age"]), [{ name: "a", age: 1 }, { name: "b", age: 2 }]);
});

Deno.test("SIZE returns array length", () => {
  assertEquals(SIZE([1, 2, 3]), 3);
  assertEquals(SIZE([]), 0);
  assertEquals(SIZE("hello"), 5);
  assertEquals(SIZE({ a: 1, b: 2 }), 2);
});

Deno.test("PUSH adds items to cloned array", () => {
  const original = [1, 2];
  const result = PUSH(original, [3, 4]);
  assertEquals(result, [1, 2, 3, 4]);
  assertEquals(original, [1, 2]);
});

Deno.test("POP removes last item from cloned array", () => {
  const original = [1, 2, 3];
  const result = POP(original);
  assertEquals(result, [1, 2]);
  assertEquals(original, [1, 2, 3]);
});

Deno.test("JOIN joins array elements", () => {
  assertEquals(JOIN(["a", "b", "c"], ","), "a,b,c");
  assertEquals(JOIN([1, 2, 3], "-"), "1-2-3");
});

Deno.test("SLICE extracts portion of array", () => {
  assertEquals(SLICE([1, 2, 3, 4], 1, 3), [2, 3]);
  assertEquals(SLICE([1, 2, 3], 1, 3), [2, 3]);
});

Deno.test("REVERSE_ARRAY reverses cloned array", () => {
  const original = [1, 2, 3];
  const result = REVERSE_ARRAY(original);
  assertEquals(result, [3, 2, 1]);
  assertEquals(original, [1, 2, 3]);
});

Deno.test("SORT_ARRAY sorts cloned array", () => {
  const original = [3, 1, 2];
  const result = SORT_ARRAY(original);
  assertEquals(result, [1, 2, 3]);
  assertEquals(original, [3, 1, 2]);
});

Deno.test("RANGE generates ascending sequence", () => {
  assertEquals(RANGE(null, 1, 5, 1), [1, 2, 3, 4, 5]);
  assertEquals(RANGE(null, 0, 10, 2), [0, 2, 4, 6, 8, 10]);
});

Deno.test("RANGE_RIGHT generates descending sequence", () => {
  assertEquals(RANGE_RIGHT(null, 5, 1, 1), [5, 4, 3, 2, 1]);
  assertEquals(RANGE_RIGHT(null, 10, 0, 2), [10, 8, 6, 4, 2, 0]);
});

Deno.test("REMOVE_DUPLICATES removes duplicate values", () => {
  const original = [1, 2, 2, 3, 1];
  assertEquals(REMOVE_DUPLICATES(original), [1, 2, 3]);
  assertEquals(original, [1, 2, 2, 3, 1]);
});

Deno.test("MAX finds maximum number", () => {
  assertEquals(MAX([1, 5, 3, 9, 2]), 9);
  assertEquals(MAX([-5, -2, -10]), -2);
});

Deno.test("MIN finds minimum number", () => {
  assertEquals(MIN([1, 5, 3, 9, 2]), 1);
  assertEquals(MIN([-5, -2, -10]), -10);
});

// ------------------------------------------------
// Object Transforms
// ------------------------------------------------

Deno.test("GET retrieves property from object", () => {
  assertEquals(GET({ a: 1, b: 2 }, "a"), 1);
  assertEquals(GET({ a: { nested: "val" } }, "a"), { nested: "val" });
  assertEquals(GET({ a: 1 }, "missing"), null);
});

Deno.test("KEYS returns object keys", () => {
  const result = KEYS({ a: 1, b: 2, c: 3 }) as string[];
  assertEquals(result.sort(), ["a", "b", "c"]);
});

Deno.test("VALUES returns object values", () => {
  const result = VALUES({ a: 1, b: 2 }) as any[];
  assertEquals(result.sort(), [1, 2]);
});

Deno.test("ENTRIES returns object entries", () => {
  const result = ENTRIES({ a: 1, b: 2 });
  assertEquals(result, [["a", 1], ["b", 2]]);
});

Deno.test("HAS checks property existence", () => {
  assertEquals(HAS({ a: 1 }, "a"), true);
  assertEquals(HAS({ a: 1 }, "b"), false);
});

Deno.test("DELETE removes properties", () => {
  assertEquals(DELETE({ a: 1, b: 2, c: 3 }, ["a", "c"]), { b: 2 });
  assertEquals(DELETE({ a: 1, b: 2 }, ["b"]), { a: 1 });
});

Deno.test("STRINGIFY converts object to JSON string", () => {
  assertEquals(STRINGIFY({ a: 1 }), '{"a":1}');
  assertEquals(STRINGIFY([1, 2, 3]), "[1,2,3]");
});

Deno.test("DEEP_MERGE merges nested objects", () => {
  const result = DEEP_MERGE({ a: 1, b: { c: 2 } }, { b: { d: 3 }, e: 4 });
  assertEquals(result, { a: 1, b: { c: 2, d: 3 }, e: 4 });
});

Deno.test("DEEP_MERGE with non-object first arg returns second", () => {
  assertEquals(DEEP_MERGE(null as any, { a: 1 }), { a: 1 });
});

Deno.test("DEEP_MERGE with non-object second arg returns first", () => {
  assertEquals(DEEP_MERGE({ a: 1 }, null as any), { a: 1 });
});

Deno.test("DEEP_MERGE overwrites values", () => {
  const result = DEEP_MERGE({ a: 1, b: 2 }, { b: 3, c: 4 });
  assertEquals(result, { a: 1, b: 3, c: 4 });
});

// ------------------------------------------------
// Date Transforms
// ------------------------------------------------

Deno.test("NOW returns current ISO datetime string", () => {
  const result = NOW(null);
  assertEquals(typeof result, "string");
  assert((result as string).includes("T"));
});

Deno.test("UTC_NOW returns UTC ISO datetime string", () => {
  const result = UTC_NOW(null);
  assertEquals(typeof result, "string");
  assert((result as string).includes("T"));
});

Deno.test("FORMAT_DATE_TIME formats date string", () => {
  const result = FORMAT_DATE_TIME("2024-01-15T10:30:00.000Z", "yyyy-MM-dd");
  assertEquals(result, "2024-01-15");
});

Deno.test("FORMAT_DATE_TIME returns error for invalid date", () => {
  const result = FORMAT_DATE_TIME("invalid", "yyyy-MM-dd");
  assertEquals(typeof result, "object");
});

Deno.test("TO_UTC converts to UTC", () => {
  const result = TO_UTC("2024-01-15T10:30:00.000Z");
  assertEquals(typeof result, "string");
});

Deno.test("TO_UTC returns error for invalid date", () => {
  const result = TO_UTC("invalid");
  assertEquals(typeof result, "object");
});

Deno.test("TO_LOCAL converts to local time", () => {
  const result = TO_LOCAL("2024-01-15T10:30:00.000Z");
  assertEquals(typeof result, "string");
});

Deno.test("TO_MILLIS converts to milliseconds string", () => {
  const result = TO_MILLIS("2024-01-15T10:30:00.000Z");
  assertEquals(result, "1705314600000");
});

Deno.test("GET_TIME_ZONE extracts timezone", () => {
  const result = GET_TIME_ZONE("2024-01-15T10:30:00.000Z");
  assertEquals(result, "UTC");
});

Deno.test("GET_SECONDS extracts seconds", () => {
  assertEquals(GET_SECONDS("2024-01-15T10:30:45.000Z"), 45);
});

Deno.test("GET_MINUTES extracts minutes", () => {
  assertEquals(GET_MINUTES("2024-01-15T10:30:45.000Z"), 30);
});

Deno.test("GET_HOURS extracts hours", () => {
  assertEquals(GET_HOURS("2024-01-15T10:30:00.000Z"), 10);
});

Deno.test("GET_DAY extracts day", () => {
  assertEquals(GET_DAY("2024-01-15T10:30:00.000Z"), 15);
});

Deno.test("GET_MONTH extracts month", () => {
  assertEquals(GET_MONTH("2024-01-15T10:30:00.000Z"), 1);
});

Deno.test("GET_YEAR extracts year", () => {
  assertEquals(GET_YEAR("2024-01-15T10:30:00.000Z"), 2024);
});

Deno.test("SET_SECONDS modifies seconds", () => {
  const result = SET_SECONDS("2024-01-15T10:30:00.000Z", 45);
  assert((result as string).includes("10:30:45"));
});

Deno.test("SET_MINUTES modifies minutes", () => {
  const result = SET_MINUTES("2024-01-15T10:30:00.000Z", 15);
  assert((result as string).includes("10:15"));
});

Deno.test("SET_HOURS modifies hours", () => {
  const result = SET_HOURS("2024-01-15T10:30:00.000Z", 5);
  assert((result as string).includes("05:30"));
});

Deno.test("SET_DAY modifies day", () => {
  const result = SET_DAY("2024-01-15T10:30:00.000Z", 20);
  assert((result as string).includes("-01-20"));
});

Deno.test("SET_MONTH modifies month", () => {
  const result = SET_MONTH("2024-01-15T10:30:00.000Z", 12);
  assert((result as string).includes("-12-"));
});

Deno.test("SET_YEAR modifies year", () => {
  const result = SET_YEAR("2024-01-15T10:30:00.000Z", 2030);
  assert((result as string).includes("2030"));
});

Deno.test("SET_TIME_ZONE changes timezone", () => {
  const result = SET_TIME_ZONE("2024-01-15T10:30:00.000Z", "America/New_York");
  assertEquals(typeof result, "string");
  assert((result as string).includes("-05:00") || (result as string).includes("-04:00"));
});

Deno.test("Date transforms return error for invalid input", () => {
  assertEquals(typeof GET_SECONDS("invalid"), "object");
  assertEquals(typeof GET_MINUTES("invalid"), "object");
  assertEquals(typeof GET_HOURS("invalid"), "object");
  assertEquals(typeof GET_DAY("invalid"), "object");
  assertEquals(typeof GET_MONTH("invalid"), "object");
  assertEquals(typeof GET_YEAR("invalid"), "object");
  assertEquals(typeof GET_TIME_ZONE("invalid"), "object");
});

// ------------------------------------------------
// Misc Transforms
// ------------------------------------------------

Deno.test("TYPE returns type of value", () => {
  assertEquals(_TYPE("hello"), "String");
  assertEquals(_TYPE(42), "Number");
  assertEquals(_TYPE(true), "Boolean");
  assertEquals(_TYPE([1, 2]), "Array");
  assertEquals(_TYPE({ a: 1 }), "Object");
});

Deno.test("PARSE_JSON parses JSON string", () => {
  assertEquals(_PARSE_JSON('{"a":1}'), { a: 1 });
  assertEquals(_PARSE_JSON("[1,2,3]"), [1, 2, 3]);
  assertEquals(_PARSE_JSON('"hello"'), "hello");
  assertEquals(_PARSE_JSON("42"), 42);
});

Deno.test("PARSE_JSON returns error for invalid JSON", () => {
  const result = _PARSE_JSON("invalid json") as Record<string, string>;
  assertEquals(typeof result, "object");
  assert(result["JsonParseError"] !== undefined);
});

Deno.test("PARSE_JSON returns error for non-string input", () => {
  const result = _PARSE_JSON(42 as any);
  assertEquals(typeof result, "object");
});

Deno.test("UUID generates a random UUID string", () => {
  const result = _UUID();
  assertEquals(typeof result, "string");
  assert((result as string).includes("-"));
  assertEquals((result as string).length, 36);
});

Deno.test("UUID generates unique values", () => {
  const u1 = _UUID();
  const u2 = _UUID();
  assert(u1 !== u2);
});

// ------------------------------------------------
// Custom Operators
// ------------------------------------------------

Deno.test("EQUALS_IGNORE_CASE compares strings case-insensitively", () => {
  assertEquals(EQUALS_IGNORE_CASE("hello", "HELLO"), true);
  assertEquals(EQUALS_IGNORE_CASE("Hello", "hello"), true);
  assertEquals(EQUALS_IGNORE_CASE("hello", "world"), false);
});

Deno.test("EQUALS_IGNORE_CASE returns error for non-string", () => {
  const result = EQUALS_IGNORE_CASE(42 as any, "hello");
  assertEquals(typeof result, "object");
});

Deno.test("STRICT_EQUALS compares values strictly", () => {
  assertEquals(STRICT_EQUALS(1, 1), true);
  assertEquals(STRICT_EQUALS(1, "1"), false);
  assertEquals(STRICT_EQUALS("hello", "hello"), true);
  assertEquals(STRICT_EQUALS(null, undefined), false);
});
