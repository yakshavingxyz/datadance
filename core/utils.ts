import { Errors } from "./constants.ts";
import { DateTimeFormatType, ErrorObject, PlainObject } from "./types.ts";
import { DateTime } from "luxon";

export const isRegExpExpression = (expression: string) => {
  try {
    new RegExp(expression);
    return true;
  } catch {
    return false;
  }
};

const TYPE_NAMES: Record<string, string> = {
  string: "String",
  number: "Number",
  boolean: "Boolean",
  object: "Object",
  undefined: "undefined",
};

export const getType = (value: unknown): string | undefined => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "Array";
  return TYPE_NAMES[typeof value];
};

const DATE_PARSERS: Record<string, (s: string) => DateTime> = {
  ISO: (s) => DateTime.fromISO(s, { setZone: true }),
  RFC2822: (s) => DateTime.fromRFC2822(s, { setZone: true }),
  SQL: (s) => DateTime.fromSQL(s, { setZone: true }),
  HTTP: (s) => DateTime.fromHTTP(s, { setZone: true }),
  Millis: (s) => DateTime.fromMillis(parseInt(s, 10)),
};

const DATE_FORMATTERS: Record<string, (d: DateTime) => string | null> = {
  ISO: (d) => d.toISO(),
  RFC2822: (d) => d.toRFC2822(),
  SQL: (d) => d.toSQL(),
  HTTP: (d) => d.toHTTP(),
  Millis: (d) => d.toMillis().toString(),
};

export const convertDateTime = (
  dateString: string,
  fromFormat: DateTimeFormatType,
  toFormat: DateTimeFormatType
): string | ErrorObject => {
  const parse = DATE_PARSERS[fromFormat];
  if (!parse) {
    return { [Errors.InvalidFromDateTimeFormat]: `Unsupported fromFormat "${fromFormat}"` };
  }

  const date = parse(dateString);

  if (!date.isValid) {
    return {
      [Errors.InvalidDateTimeString]:
        `Invalid date time string "${dateString}". Reason: ${date.invalidReason}`,
    };
  }

  const format = DATE_FORMATTERS[toFormat];
  if (!format) {
    return { [Errors.InvalidToDateTimeFormat]: `Error: Unsupported toFormat "${toFormat}"` };
  }

  return format(date) || `Error: Failed to convert to ${toFormat} format`;
};

export const isValidDateTime = (dateTimeString: string) => {
  return DateTime.fromISO(dateTimeString, { setZone: true }).isValid;
};

export const symmetricDifference = (setA: Set<string>, setB: Set<string>): Set<string> => {
  const difference = new Set(setA);
  for (const elem of setB) {
    if (difference.has(elem)) {
      difference.delete(elem);
    } else {
      difference.add(elem);
    }
  }
  return difference;
};

export const isObject = (value: unknown): value is PlainObject => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};
