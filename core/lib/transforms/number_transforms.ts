// Copyright (c) 2024-Present The Yak Shaving Devs, MIT License

import { withNumber } from "../../type_helpers.ts";

export const ABS = (val: number) => withNumber(val, "abs", (n) => Math.abs(n));

export const CEIL = (val: number) => withNumber(val, "ceil", (n) => Math.ceil(n));

export const FLOOR = (val: number) => withNumber(val, "floor", (n) => Math.floor(n));

export const ROUND = (val: number) => withNumber(val, "round", (n) => Math.round(n));

export const RANDOM = (_val: null) => Math.random();
