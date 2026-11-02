import type { DatePart, DateRange, Temporal } from "./date.ts";
import { perLocale } from "./per-locale.ts";

/** A segment of a date field, or the text between two segments. */
export type DateLayoutItem = { part: DatePart } | { literal: string };

const isDatePart = (type: string): type is DatePart =>
  type === "year" || type === "month" || type === "day";

// The day's start in UTC, which every format below also reads in, so it shows the PlainDate's own day.
const toUtc = (date: Temporal.PlainDate) => date.toZonedDateTime("UTC").epochMilliseconds;

/** 3 February 2001: every field differs, so a format's parts show their order unambiguously. */
const sample = Date.UTC(2001, 1, 3);

function buildDateFormats(locale: string | undefined) {
  // Dates are Gregorian (ADR-0004): th-TH's default Buddhist calendar would head the Calendar with
  // another year than the DateField shows.
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, calendar: "gregory", timeZone: "UTC" });

  const numeric = format({ year: "numeric", month: "2-digit", day: "2-digit" });
  const resolvedLocale = numeric.resolvedOptions().locale;
  const fieldNames = new Intl.DisplayNames(resolvedLocale, { type: "dateTimeField" });
  const monthFormat = format({ month: "long" });
  const headingFormat = format({ month: "long", year: "numeric" });
  const fullFormat = format({ dateStyle: "full" });
  const weekdayFormats = { short: format({ weekday: "short" }), long: format({ weekday: "long" }) };

  return {
    /** The segments and the text between them, in the locale's order. */
    layout: numeric
      .formatToParts(sample)
      .map(({ type, value }): DateLayoutItem =>
        isDatePart(type) ? { part: type } : { literal: value },
      ),
    /** The text between the two dates of a range, such as " – ". */
    rangeSeparator: numeric
      .formatRangeToParts(sample, Date.UTC(2002, 1, 3))
      .filter(({ source }) => source === "shared")
      .map(({ value }) => value)
      .join(""),
    /** The first day of the week, numbered as `PlainDate.dayOfWeek`: 1 (Monday) to 7 (Sunday). */
    firstDay: new Intl.Locale(resolvedLocale).getWeekInfo().firstDay,
    /** A segment's name, such as "month". */
    name: (part: DatePart) => fieldNames.of(part) ?? part,
    /** A month's name, from 1 (January) to 12. */
    monthName: (month: number) => monthFormat.format(Date.UTC(2001, month - 1, 1)),
    /** A month and its year, such as "February 2001". */
    heading: (date: Temporal.PlainDate) => headingFormat.format(toUtc(date)),
    /** A day with its weekday, such as "Saturday, 3 February 2001". */
    full: (date: Temporal.PlainDate) => fullFormat.format(toUtc(date)),
    fullRange: ({ start, end }: DateRange) => fullFormat.formatRange(toUtc(start), toUtc(end)),
    weekday: (date: Temporal.PlainDate, style: "short" | "long") =>
      weekdayFormats[style].format(toUtc(date)),
  };
}

/** The app's locale's date formats, built once per locale and then shared. */
export const useDateFormats = perLocale(buildDateFormats);
