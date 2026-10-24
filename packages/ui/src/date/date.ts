import { Temporal } from "temporal-polyfill";

export { Temporal };

export type DatePart = "year" | "month" | "day";

type WeekInfoLocale = Intl.Locale & { getWeekInfo: () => { readonly firstDay: number } };

// Intl Locale Info (Baseline newly available, 2026-07-21) is not in TypeScript 7.0's libs yet.
const hasWeekInfo = (locale: Intl.Locale): locale is WeekInfoLocale => "getWeekInfo" in locale;

const firstDayOf = (tag: string) => {
  const locale = new Intl.Locale(tag);
  return hasWeekInfo(locale) ? locale.getWeekInfo().firstDay : 1;
};

const isPart = (type: string): type is DatePart =>
  type === "year" || type === "month" || type === "day";

const utc = (date: Temporal.PlainDate) => Date.UTC(date.year, date.month - 1, date.day);

function build(tag: string) {
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(tag, { ...options, timeZone: "UTC" });
  const numeric = format({ year: "numeric", month: "2-digit", day: "2-digit" });
  const names = new Intl.DisplayNames(tag, { type: "dateTimeField" });
  const month = format({ month: "long" });
  const heading = format({ month: "long", year: "numeric" });
  const full = format({ dateStyle: "full" });
  const weekday = { short: format({ weekday: "short" }), long: format({ weekday: "long" }) };
  return {
    /** Segments and separator texts in the Locale's order. */
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
    firstDay: firstDayOf(tag),
  };
}

const cache = new Map<string, ReturnType<typeof build>>();

/** Intl formatters for one Locale tag, created on first use. */
export function dateFormats(tag: string) {
  const cached = cache.get(tag) ?? build(tag);
  cache.set(tag, cached);
  return cached;
}
