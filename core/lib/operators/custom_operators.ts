// Copyright (c) 2024-Present The Yak Shaving Devs, MIT License

import { withBothStrings } from "../../type_helpers.ts";

export const EQUALS_IGNORE_CASE = (left: string, right: string) =>
  withBothStrings(left, right, "_=", (a, b) => a.toLowerCase() === b.toLowerCase());

export const STRICT_EQUALS = (left: any, right: any) => left === right;
