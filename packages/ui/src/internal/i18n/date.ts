import { Temporal } from "temporal-polyfill";

// The one import of the polyfill, so moving to the global Temporal changes only this line (ADR-0004).
export { Temporal };

export type DatePart = "year" | "month" | "day";

/** A start and an end day, in order; a one-day range has the same day as both. */
export interface DateRange {
  readonly start: Temporal.PlainDate;
  readonly end: Temporal.PlainDate;
}

/** The range between two days, whichever comes first. */
export function ordered(a: Temporal.PlainDate, b: Temporal.PlainDate): DateRange {
  return Temporal.PlainDate.compare(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

/** Whether two ranges, or no range, are the same days. */
export function sameRange(a: DateRange | null, b: DateRange | null) {
  if (a === null || b === null) return a === b;

  return a.start.equals(b.start) && a.end.equals(b.end);
}
