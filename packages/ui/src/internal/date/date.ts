import { createContext } from "react";
import { Temporal } from "temporal-polyfill";

import { useLocale } from "../locale/use-locale.ts";

export { Temporal };

export type DatePart = "year" | "month" | "day";

const isPart = (type: string): type is DatePart =>
  type === "year" || type === "month" || type === "day";

const utc = (date: Temporal.PlainDate) => Date.UTC(date.year, date.month - 1, date.day);

function build(locale: string | undefined) {
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
    weekday: (date: Temporal.PlainDate, style: "short" | "long") =>
      weekday[style].format(utc(date)),
    /** 1 (Monday) to 7 (Sunday), the numbering of `PlainDate.dayOfWeek`. */
    firstDay: new Intl.Locale(tag).getWeekInfo().firstDay,
  };
}

const cache = new Map<string, ReturnType<typeof build>>();

/** Intl formatters in the app's locale, created on first use. */
export function useDateFormats() {
  const locale = useLocale();
  const key = String(locale);
  const cached = cache.get(key) ?? build(locale);

  cache.set(key, cached);

  return cached;
}

/** What a Calendar inside a DatePicker reads instead of its own props. */
export interface DatePickerContextValue {
  readonly open: boolean;
  readonly value: Temporal.PlainDate | null;
  readonly min: Temporal.PlainDate | undefined;
  readonly max: Temporal.PlainDate | undefined;
  readonly isDateUnavailable: ((date: Temporal.PlainDate) => boolean) | undefined;
  readonly choose: (date: Temporal.PlainDate, event: Event) => void;
  /** Whether focus is still where the open left it (the trigger, the panel or nowhere). */
  readonly canFocus: () => boolean;
}

export const DatePickerContext = createContext<DatePickerContextValue | null>(null);
