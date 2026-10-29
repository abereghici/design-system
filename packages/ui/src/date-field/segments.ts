import { Temporal } from "../internal/date/date.ts";
import type { DatePart } from "../internal/date/date.ts";

export type Segments = Readonly<Partial<Record<DatePart, number>>>;

export function bounds(part: DatePart, segments: Segments) {
  if (part === "year") return { min: 1, max: 9999 };

  if (part === "month") return { min: 1, max: 12 };

  const { year, month } = segments;
  const max =
    year === undefined || month === undefined
      ? 31
      : Temporal.PlainYearMonth.from({ year, month }).daysInMonth;

  return { min: 1, max };
}

/** The complete date, with an impossible day moved to the month's last (`overflow: "constrain"`). */
export function toDate({ year, month, day }: Segments) {
  return year === undefined || month === undefined || day === undefined
    ? null
    : Temporal.PlainDate.from({ year, month, day }, { overflow: "constrain" });
}

export function fromDate(date: Temporal.PlainDate | null): Segments {
  return date === null ? {} : { year: date.year, month: date.month, day: date.day };
}

/** Adds a typed digit; `done` means the segment can take no more digits and focus moves on. */
export function typeDigit(part: DatePart, segments: Segments, buffer: string, digit: string) {
  const { max } = bounds(part, segments);
  const joined = buffer + digit;
  const text = Number(joined) > max ? digit : joined;
  const value = Number(text);
  const done = part === "year" ? text.length === 4 : text.length === 2 || value * 10 > max;

  return {
    segments: { ...segments, [part]: value === 0 ? undefined : value },
    buffer: done ? "" : text,
    done,
  };
}

/** Arrow keys, Home and End; an empty segment starts from today's part. */
export function stepKey(part: DatePart, segments: Segments, key: string) {
  const { min, max } = bounds(part, segments);
  const current = segments[part];
  const step = (delta: number) =>
    current === undefined
      ? Temporal.Now.plainDateISO()[part]
      : ((current - min + delta + (max - min + 1)) % (max - min + 1)) + min;
  const next = new Map([
    ["ArrowUp", () => step(1)],
    ["ArrowDown", () => step(-1)],
    ["Home", () => min],
    ["End", () => max],
  ]).get(key);

  return next === undefined ? null : { ...segments, [part]: next() };
}

export function display(part: DatePart, segments: Segments, buffer: string) {
  if (buffer !== "") return buffer;

  const value = segments[part];

  if (value === undefined) return null;

  return part === "year" ? String(value) : String(value).padStart(2, "0");
}
