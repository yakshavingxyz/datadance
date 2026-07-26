import { transform, isTemporaryField, isSubTransformBlock, cleanTemporaryFields, updateDerivedState } from "../transform.ts";
import { assertEquals, assert } from "$std/assert/mod.ts";

Deno.test("transform with simple pipe expression", async () => {
  const result = await transform({
    input: { name: "Alice" },
    transforms: [{ name: 'input.name | upper' }],
    settings: { merge_method: "transforms_only" },
  });
  assertEquals(result, { name: "ALICE" });
});

Deno.test("transform with overwrite merge method", async () => {
  const result = await transform({
    input: { name: "Alice", age: 30 },
    transforms: [{ name: 'input.name | upper' }],
    settings: { merge_method: "overwrite" },
  });
  assertEquals(result, { name: "ALICE", age: 30 });
});

Deno.test("transform with preserve merge method", async () => {
  const result = await transform({
    input: { name: "Alice", age: 30 },
    transforms: [{ name: 'input.name | upper' }],
    settings: { merge_method: "preserve" },
  });
  assertEquals(result.name, "Alice");
  assertEquals(result.transforms.name, "ALICE");
});

Deno.test("transform with multiple fields", async () => {
  const result = await transform({
    input: { first: "John", last: "Doe" },
    transforms: [
      { fullName: 'input.first + " " + input.last' },
      { greeting: 'derived.fullName | upper' },
    ],
    settings: { merge_method: "transforms_only" },
  });
  assertEquals(result, { fullName: "John Doe", greeting: "JOHN DOE" });
});

Deno.test("transform with nested transformations", async () => {
  const result = await transform({
    input: { user: { first: "Jane", last: "Smith" } },
    transforms: [{
      user: [
        { name: 'input.user.first + " " + input.user.last' },
        { upperName: 'derived.user.name | upper' },
      ],
    }],
    settings: { merge_method: "transforms_only" },
  });
  assertEquals(result, { user: { name: "Jane Smith", upperName: "JANE SMITH" } });
});

Deno.test("transform with temporary fields", async () => {
  const result = await transform({
    input: { first: "John", last: "Doe" },
    transforms: [
      { _full: 'input.first + " " + input.last' },
      { display: 'derived._full | upper' },
    ],
    settings: { merge_method: "transforms_only" },
  });
  assertEquals(result, { display: "JOHN DOE" });
});

Deno.test("transform returns error for invalid transform with multiple keys", async () => {
  const result = await transform({
    input: {},
    transforms: [{ a: "1", b: "2" }] as any,
    settings: { merge_method: "transforms_only" },
  });
  assert(typeof result === "object");
  assert("InvalidTransform" in result);
});

Deno.test("transform returns error for invalid merge method", async () => {
  const result = await transform({
    input: { x: 1 },
    transforms: [{ x: "input.x" }],
    settings: { merge_method: "invalid" as any },
  });
  assert(typeof result === "object");
  assert("InvalidMergeMethod" in result);
});

Deno.test("transform with DDS input syntax", async () => {
  const result = await transform({
    input: { name: "Alice" },
    transforms: "name: input.name | upper",
    settings: { transforms_syntax: "dds", merge_method: "transforms_only" },
  } as any);
  assertEquals(result, { name: "ALICE" });
});

Deno.test("transform handles variable not in context", async () => {
  const result = await transform({
    input: {},
    transforms: [{ x: "input.missing" }],
    settings: { merge_method: "transforms_only" },
  });
  assert(typeof result === "object");
  assert(result.x === undefined || typeof result.x === "object");
});

Deno.test("transform with array join + upper", async () => {
  const result = await transform({
    input: { items: ["a", "b", "c"] },
    transforms: [{ items: 'input.items | join(",") | upper' }],
    settings: { merge_method: "transforms_only" },
  });
  assertEquals(result.items, "A,B,C");
});

Deno.test("transform handles empty transforms list", async () => {
  const result = await transform({
    input: { x: 1 },
    transforms: [],
    settings: { merge_method: "transforms_only" },
  });
  assertEquals(result, {});
});

Deno.test("transform evaluatesExpression transform", async () => {
  const result = await transform({
    input: { name: "World" },
    transforms: [{
      greeting: '"Hello {{name}}!" | evaluateExpression(input)',
    }],
    settings: { merge_method: "transforms_only" },
  });
  assertEquals(result.greeting, "Hello World!");
});

Deno.test("transform with nested arithmetic and temporary fields", async () => {
  const result = await transform({
    input: { a: 1, b: 2, c: 3 },
    transforms: [{
      nested: [
        { _sum: 'input.a + input.b + input.c' },
        { product: 'input.a * input.b * input.c' },
        { total: 'derived.nested._sum' },
      ],
    }],
    settings: { merge_method: "transforms_only" },
  });
  assertEquals(result, { nested: { product: 6, total: 6 } });
});

Deno.test("transform with math operations", async () => {
  const result = await transform({
    input: { score: 10 },
    transforms: [{ score: 'input.score + 15' }],
    settings: { merge_method: "overwrite" },
  });
  assertEquals(result.score, 25);
});

// ------------------------------------------------
// Internal helper tests
// ------------------------------------------------

Deno.test("isTemporaryField detects temporary fields", () => {
  assertEquals(isTemporaryField("_temp"), true);
  assertEquals(isTemporaryField("_$block"), false);
  assertEquals(isTemporaryField("normal"), false);
});

Deno.test("isSubTransformBlock detects sub-transform blocks", () => {
  assertEquals(isSubTransformBlock("_$func"), true);
  assertEquals(isSubTransformBlock("_temp"), false);
  assertEquals(isSubTransformBlock("normal"), false);
});

Deno.test("cleanTemporaryFields removes temp fields", () => {
  const result = cleanTemporaryFields({ a: 1, _temp: 2, b: 3 });
  assertEquals(result, { a: 1, b: 3 });
});

Deno.test("cleanTemporaryFields preserves non-temp fields", () => {
  const result = cleanTemporaryFields({ a: 1, b: 2 });
  assertEquals(result, { a: 1, b: 2 });
});

Deno.test("updateDerivedState sets value at path", () => {
  const target = { a: { b: {} } };
  updateDerivedState(target, { b: "val" }, ["a", "b"]);
  assertEquals(target.a.b, "val");
});

Deno.test("updateDerivedState creates nested paths", () => {
  const target = {};
  updateDerivedState(target, { b: "val" }, ["a", "b"]);
  assertEquals(target, { a: { b: "val" } });
});
