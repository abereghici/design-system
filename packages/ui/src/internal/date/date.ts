import { createContext } from "react";
import { Temporal } from "temporal-polyfill";

import { perLocale } from "../locale/per-locale.ts";

export { Temporal };

export type DatePart = "year" | "month" | "day";

/** A start and an end day, in order; a one-day range has the same day as both. */
export interface DateRange {
  readonly start: Temporal.PlainDate;
  readonly end: Temporal.PlainDate;
}

/** The range between two days, whichever comes first. */
export const ordered = (a: Temporal.PlainDate, b: Temporal.PlainDate): DateRange =>
  Temporal.PlainDate.compare(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };

/** Whether two ranges, or no range, are the same days. */
export const sameRange = (a: DateRange | null, b: DateRange | null) =>
  a === b || (a !== null && b !== null && a.start.equals(b.start) && a.end.equals(b.end));

const isPart = (type: string): type is DatePart =>
  type === "year" || type === "month" || type === "day";

const utc = (date: Temporal.PlainDate) => Date.UTC(date.year, date.month - 1, date.day);

function buildDateFormats(locale: string | undefined) {
  // Dates are Gregorian (ADR-0004); a locale whose default calendar differs, such as th-TH's
  // Buddhist one, would otherwise head the Calendar with another year than the DateField shows.
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, calendar: "gregory", timeZone: "UTC" });
  const numeric = format({ year: "numeric", month: "2-digit", day: "2-digit" });
  const tag = numeric.resolvedOptions().locale;
  const names = new Intl.DisplayNames(tag, { type: "dateTimeField" });
  const month = format({ month: "long" });
  const heading = format({ month: "long", year: "numeric" });
  const full = format({ dateStyle: "full" });
  const weekday = { short: format({ weekday: "short" }), long: format({ weekday: "long" }) };

  return {
    /** Segments and separator texts in the locale's order. */
    layout: numeric
      .formatToParts(Date.UTC(2001, 1, 3))
      .map(({ type, value }) => (isPart(type) ? { part: type } : { literal: value })),
    name: (part: DatePart) => names.of(part) ?? part,
    monthName: (value: number) => month.format(Date.UTC(2001, value - 1, 1)),
    heading: (date: Temporal.PlainDate) => heading.format(utc(date)),
    full: (date: Temporal.PlainDate) => full.format(utc(date)),
    fullRange: ({ start, end }: DateRange) => full.formatRange(utc(start), utc(end)),
    /** The text between the two dates of a range, such as " – ". */
    rangeSeparator: numeric
      .formatRangeToParts(Date.UTC(2001, 1, 3), Date.UTC(2002, 1, 3))
      .filter(({ source }) => source === "shared")
      .map(({ value }) => value)
      .join(""),
    weekday: (date: Temporal.PlainDate, style: "short" | "long") =>
      weekday[style].format(utc(date)),
    /** 1 (Monday) to 7 (Sunday), the numbering of `PlainDate.dayOfWeek`. */
    firstDay: new Intl.Locale(tag).getWeekInfo().firstDay,
  };
}

/** Intl formatters in the app's locale, created on first use. */
export const useDateFormats = perLocale(buildDateFormats);

/** What a Calendar inside a DatePicker, or a RangeCalendar inside a DateRangePicker, reads in place of its own props. */
export interface PickerContextValue<Value> {
  readonly open: boolean;
  readonly value: Value | null;
  readonly min: Temporal.PlainDate | undefined;
  readonly max: Temporal.PlainDate | undefined;
  readonly isDateUnavailable: ((date: Temporal.PlainDate) => boolean) | undefined;
  readonly choose: (value: Value, event: Event) => void;
  /** Whether focus is still where the open left it (the trigger, the panel or nowhere). */
  readonly canFocus: () => boolean;
}

export const DatePickerContext = createContext<PickerContextValue<Temporal.PlainDate> | null>(null);

export const DateRangePickerContext = createContext<PickerContextValue<DateRange> | null>(null);
