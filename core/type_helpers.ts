// Copyright (c) 2024-Present The Yak Shaving Devs, MIT License

/**
 * Reusable type-checking helpers that eliminate repetitive boilerplate
 * in transform functions. Each helper:
 *   1. Checks the expected type
 *   2. Runs the transform if the type is correct
 *   3. Returns a descriptive error object otherwise
 */

import { Errors } from "./constants.ts";
import { PlainObject } from "./types.ts";
import { getType } from "./utils.ts";

export function typeError(value: unknown, methodName: string, expectedType: string) {
  return {
    [Errors.MethodNotDefinedForType]:
      `The ${value} of type ${getType(value)} has no method '${methodName}'. ` +
      `<value> | ${methodName} is only supported for ${expectedType}`,
  };
}

export function withString(value: unknown, methodName: string, fn: (s: string) => unknown) {
  if (typeof value === "string") return fn(value);
  return typeError(value, methodName, "String");
}

export function withNumber(value: unknown, methodName: string, fn: (n: number) => unknown) {
  if (typeof value === "number") return fn(value);
  return typeError(value, methodName, "Number");
}

export function withArray(value: unknown, methodName: string, fn: (a: unknown[]) => unknown) {
  if (Array.isArray(value)) return fn(value);
  return typeError(value, methodName, "Array");
}

export function withClonedArray(value: unknown, methodName: string, fn: (a: unknown[]) => unknown) {
  if (Array.isArray(value)) return fn(structuredClone(value));
  return typeError(value, methodName, "Array");
}

export function withObject(value: unknown, methodName: string, fn: (o: PlainObject) => unknown) {
  if (typeof value === "object" && !Array.isArray(value) && value !== null) return fn(value as PlainObject);
  return typeError(value, methodName, "Object");
}

export function withObjectOrArray(value: unknown, methodName: string, fn: (o: unknown) => unknown) {
  if (typeof value === "object" && value !== null) return fn(value);
  return typeError(value, methodName, "Object or Array");
}

export function withBothStrings(left: unknown, right: unknown, operatorName: string, fn: (a: string, b: string) => unknown) {
  if (typeof left === "string" && typeof right === "string") return fn(left, right);
  return {
    [Errors.OperatorNotDefinedForType]:
      `${getType(left)} ${operatorName} ${getType(right)} is an invalid operation. ` +
      `"${operatorName}" only supports string types.`,
  };
}
