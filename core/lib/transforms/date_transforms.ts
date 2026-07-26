// Copyright (c) 2024-Present The Yak Shaving Devs, MIT License

import { DateTime } from "luxon";
import { DateTimeFormatType } from "../../types.ts";
import { withString } from "../../type_helpers.ts";
import { convertDateTime, isValidDateTime } from "../../utils.ts";
import { Errors } from "../../constants.ts";

function withValidDate(val: unknown, methodName: string, fn: (dt: DateTime) => unknown) {
  return withString(val, methodName, (s) => {
    if (!isValidDateTime(s)) return { [Errors.InvalidDateTimeString]: "Invalid date time string provided" };
    return fn(DateTime.fromISO(s, { setZone: true }));
  });
}

export const FORMAT_DATE_TIME = (val: string, format: string = "yyyy-MM-dd") =>
  withValidDate(val, "formatDateTime", (dt) => dt.toFormat(format));

export const CONVERT_DATE_TIME_FORMAT = (
  val: string,
  fromFormat: DateTimeFormatType,
  toFormat: DateTimeFormatType
) => withString(val, "convertDateTimeFormat", (s) => convertDateTime(s, fromFormat, toFormat));

export const NOW = (_val: any) =>
  DateTime.now().toISO() || {
    [Errors.ErrorFetchingCurrentLocalDateTime]: "Error fetching current local date time",
  };

export const UTC_NOW = (_val: any) =>
  DateTime.now().toUTC().toISO() || {
    [Errors.ErrorFetchingCurrentLocalDateTime]: "Error fetching current UTC date time",
  };

export const TO_UTC = (val: string) =>
  withValidDate(val, "toUTC", (dt) =>
    dt.toUTC().toISO() || {
      [Errors.ErrorConvertingDateTimeToUTC]: "Error while converting date time to UTC",
    }
  );

export const TO_LOCAL = (val: string) =>
  withValidDate(val, "toLocal", (dt) =>
    dt.toLocal().toISO() || {
      [Errors.ErrorConvertingDateTimeToLocal]: "Error while converting date time to local",
    }
  );

export const TO_MILLIS = (val: string) =>
  withValidDate(val, "toMillis", (dt) => dt.toMillis().toString());

export const GET_TIME_ZONE = (val: string) =>
  withValidDate(val, "getTimeZone", (dt) => dt.zoneName);

const DATE_GETTERS: Record<string, (dt: DateTime) => unknown> = {
  getSeconds: (dt) => dt.second,
  getMinutes: (dt) => dt.minute,
  getHours: (dt) => dt.hour,
  getDay: (dt) => dt.day,
  getMonth: (dt) => dt.month,
  getYear: (dt) => dt.year,
};

export const GET_SECONDS = (val: string) => withValidDate(val, "getSeconds", DATE_GETTERS.getSeconds);
export const GET_MINUTES = (val: string) => withValidDate(val, "getMinutes", DATE_GETTERS.getMinutes);
export const GET_HOURS = (val: string) => withValidDate(val, "getHours", DATE_GETTERS.getHours);
export const GET_DAY = (val: string) => withValidDate(val, "getDay", DATE_GETTERS.getDay);
export const GET_MONTH = (val: string) => withValidDate(val, "getMonth", DATE_GETTERS.getMonth);
export const GET_YEAR = (val: string) => withValidDate(val, "getYear", DATE_GETTERS.getYear);

function setDateComponent(val: string, unit: string, newValue: number, methodName: string) {
  return withValidDate(val, methodName, (dt) =>
    dt.set({ [unit]: newValue }).toString()
  );
}

export const SET_SECONDS = (val: string, seconds: number) =>
  setDateComponent(val, "second", seconds, "setSeconds");

export const SET_MINUTES = (val: string, minutes: number) =>
  setDateComponent(val, "minute", minutes, "setMinutes");

export const SET_HOURS = (val: string, hours: number) =>
  setDateComponent(val, "hour", hours, "setHours");

export const SET_DAY = (val: string, day: number) =>
  setDateComponent(val, "day", day, "setDay");

export const SET_MONTH = (val: string, month: number) =>
  setDateComponent(val, "month", month, "setMonth");

export const SET_YEAR = (val: string, year: number) =>
  setDateComponent(val, "year", year, "setYear");

export const SET_TIME_ZONE = (val: string, timeZone: string) =>
  withValidDate(val, "setTimeZone", (dt) => dt.setZone(timeZone).toString());
