import { Temporal } from "temporal-polyfill";

export { Temporal };

export type DatePart = "year" | "month" | "day";

const isPart = (type: string): type is DatePart =>
  type === "year" || type === "month" || type === "day";

const utc = (date: Temporal.PlainDate) => new Date(Date.UTC(date.year, date.month - 1, date.day));

function build(tag: string) {
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(tag, { ...options, timeZone: "UTC" });
  const numeric = format({ year: "numeric", month: "2-digit", day: "2-digit" });
  const names = new Intl.DisplayNames(tag, { type: "dateTimeField" });
  const month = format({ month: "long" });
  return {
    /** Segments and separator texts in the Locale's order. */
    layout: numeric
      .formatToParts(utc(Temporal.PlainDate.from({ year: 2001, month: 2, day: 3 })))
      .map(({ type, value }) => (isPart(type) ? { part: type } : { literal: value })),
    name: (part: DatePart) => names.of(part) ?? part,
    monthName: (value: number) => month.format(Date.UTC(2001, value - 1, 1)),
  };
}

const cache = new Map<string, ReturnType<typeof build>>();

/** Intl formatters for one Locale tag, created on first use. */
export function dateFormats(tag: string) {
  const cached = cache.get(tag) ?? build(tag);
  cache.set(tag, cached);
  return cached;
}
