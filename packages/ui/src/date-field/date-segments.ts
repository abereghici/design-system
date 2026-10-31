import { Temporal, useDateFormats } from "../internal/date/date.ts";
import type { DatePart } from "../internal/date/date.ts";
import type { SegmentModel, Segments } from "../internal/segment-field/segments.ts";

function bounds(part: DatePart, { year, month }: Segments<DatePart>) {
  if (part === "year") return { min: 1, max: 9999 };

  if (part === "month") return { min: 1, max: 12 };

  const max =
    year === undefined || month === undefined
      ? 31
      : Temporal.PlainYearMonth.from({ year, month }).daysInMonth;

  return { min: 1, max };
}

/** A date's day, month and year segments, in the app's Locale. */
export function useDateSegments(): SegmentModel<DatePart, Temporal.PlainDate> {
  const formats = useDateFormats();

  return {
    layout: formats.layout,
    name: formats.name,
    bounds,
    digits: (part) => (part === "year" ? 4 : 2),
    text: (part, value) => (part === "year" ? String(value) : String(value).padStart(2, "0")),
    spoken: (part, value) => (part === "month" ? formats.monthName(value) : undefined),
    // An impossible day moves to the month's last (`overflow: "constrain"`).
    toValue: ({ year, month, day }) =>
      year === undefined || month === undefined || day === undefined
        ? null
        : Temporal.PlainDate.from({ year, month, day }, { overflow: "constrain" }),
    fromValue: (date) =>
      date === null ? {} : { year: date.year, month: date.month, day: date.day },
    now: () => Temporal.Now.plainDateISO(),
    input: "date",
    serialize: (date) => date.toString(),
  };
}
