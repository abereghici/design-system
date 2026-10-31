import { Temporal } from "../internal/date/date.ts";
import { useLocale } from "../internal/locale/use-locale.ts";
import type { SegmentModel } from "../internal/segment-field/segments.ts";

export type TimePart = "hour" | "minute" | "dayPeriod";

const isPart = (type: string): type is TimePart =>
  type === "hour" || type === "minute" || type === "dayPeriod";

function build(locale: string | undefined): SegmentModel<TimePart, Temporal.PlainTime> {
  const format = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
  const { hourCycle, locale: tag } = format.resolvedOptions();
  const twelve = hourCycle === "h11" || hourCycle === "h12";
  const cycle = twelve ? 12 : 24;
  // h12 and h24 count from 1 (12 AM, 24:00); h11 and h23 from 0.
  const first = hourCycle === "h12" || hourCycle === "h24" ? 1 : 0;
  const names = new Intl.DisplayNames(tag, { type: "dateTimeField" });
  const periods = [1, 13].map(
    (hour) =>
      format.formatToParts(Date.UTC(2001, 0, 1, hour)).find(({ type }) => type === "dayPeriod")
        ?.value ?? "",
  );

  return {
    layout: format
      .formatToParts(Date.UTC(2001, 0, 1, 13, 5))
      .map(({ type, value }) => (isPart(type) ? { part: type } : { literal: value })),
    name: (part) => names.of(part) ?? part,
    bounds: (part) =>
      part === "hour"
        ? { min: first, max: first + cycle - 1 }
        : { min: 0, max: part === "minute" ? 59 : 1 },
    digits: (part) => (part === "dayPeriod" ? 0 : 2),
    text: (part, value) =>
      part === "dayPeriod" ? (periods[value] ?? "") : String(value).padStart(2, "0"),
    spoken: (part, value) => (part === "dayPeriod" ? periods[value] : undefined),
    toValue: ({ hour, minute, dayPeriod }) =>
      hour === undefined || minute === undefined || (twelve && dayPeriod === undefined)
        ? null
        : Temporal.PlainTime.from({ hour: (hour % cycle) + (dayPeriod ?? 0) * 12, minute }),
    fromValue: (time) =>
      time === null
        ? {}
        : {
            hour: time.hour % cycle || first * cycle,
            minute: time.minute,
            ...(twelve ? { dayPeriod: time.hour < 12 ? 0 : 1 } : {}),
          },
    now: () => Temporal.Now.plainTimeISO(),
    input: "time",
    serialize: (time) => time.toString({ smallestUnit: "minute" }),
  };
}

const cache = new Map<string, ReturnType<typeof build>>();

/** A time's hour, minute and day period segments, in the app's Locale and its hour cycle. */
export function useTimeSegments() {
  const locale = useLocale();
  const key = String(locale);
  const cached = cache.get(key) ?? build(locale);

  cache.set(key, cached);

  return cached;
}
