"use client";

import {
  use,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { flushSync } from "react-dom";
import type { ComponentProps, FocusEvent, KeyboardEvent, MouseEvent } from "react";

import { DatePickerContext, dateFormats, Temporal } from "../date/date.ts";
import type { DatePickerContextValue } from "../date/date.ts";
import { requestChange, sharedListener } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { mergeProps } from "../slot/slot.tsx";
import { useLabels } from "../ui-provider/locale.tsx";
import type { Labels } from "../ui-provider/locale.tsx";
import { calendar as calendarLabels } from "../ui-provider/locales/en-US/calendar.ts";

import { Grid, keyTarget } from "./calendar-grid.tsx";
import { Header } from "./calendar-header.tsx";
import styles from "./calendar.module.css";

export type CalendarChangeEventDetails = Details<"day-press">;

export interface CalendarProps extends Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onChange" | "role" | "children" | "disabled" | "name" | "form"
> {
  /** The chosen date, when your state holds it; `null` is no date. */
  value?: Temporal.PlainDate | null | undefined;
  /** The starting value when it holds its own state. */
  defaultValue?: Temporal.PlainDate | null | undefined;
  /** Called before a day is chosen; `details.cancel()` keeps the previous one. */
  onValueChange?:
    | ((value: Temporal.PlainDate, details: CalendarChangeEventDetails) => void)
    | undefined;
  /** The earliest day that can be chosen; months before it can't be reached. */
  min?: Temporal.PlainDate | undefined;
  /** The latest day that can be chosen; months after it can't be reached. */
  max?: Temporal.PlainDate | undefined;
  /** Days that can't be chosen, such as weekends or booked dates. They stay readable. */
  isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
  /**
   * The language of the month, weekday and day names, and the first day of the week, such as
   * "ro-RO". Pass the same one on the server and in the browser; without it, the runtime's default
   * language is used. Inside a DatePicker, the DatePicker's `locale` is used.
   */
  locale?: Intl.LocalesArgument;
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: Partial<Labels["calendar"]> | undefined;
}

const onFocusIn = sharedListener("focusin", () => document);

const clamp = (date: Temporal.PlainDate, min?: Temporal.PlainDate, max?: Temporal.PlainDate) => {
  if (min !== undefined && Temporal.PlainDate.compare(date, min) < 0) return min;
  if (max !== undefined && Temporal.PlainDate.compare(date, max) > 0) return max;
  return date;
};

function useToday() {
  // The server renders UTC's date; the browser corrects it to its own time zone after hydration:
  // https://react.dev/reference/react/useSyncExternalStore#adding-support-for-server-rendering
  const iso = useSyncExternalStore(
    onFocusIn,
    () => Temporal.Now.plainDateISO().toString(),
    () => Temporal.Now.plainDateISO("UTC").toString(),
  );
  return Temporal.PlainDate.from(iso);
}

function useCalendar(
  { value, defaultValue = null, onValueChange, min, max, isDateUnavailable }: CalendarProps,
  picker: DatePickerContextValue | null,
) {
  const today = useToday();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const selected = value === undefined ? uncontrolled : value;
  const start = clamp(selected ?? today, min, max);
  const [userFocus, setFocused] = useState<Temporal.PlainDate | null>(null);
  const open = picker?.open === true;
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setFocused(null);
  }
  const focused = userFocus === null ? start : clamp(userFocus, min, max);
  const outside = (date: Temporal.PlainDate) => clamp(date, min, max) !== date;
  const unavailable = (date: Temporal.PlainDate) =>
    outside(date) || isDateUnavailable?.(date) === true;
  const choose = (date: Temporal.PlainDate, event: Event) => {
    setFocused(date);
    if (unavailable(date)) return;
    if (picker !== null) {
      picker.choose(date, event);
      return;
    }
    if (selected?.equals(date) === true) return;
    if (requestChange(onValueChange, date, "day-press", event)) setUncontrolled(date);
  };
  return { today, selected, start, focused, setFocused, outside, unavailable, choose };
}

const dayOf = (target: EventTarget) => {
  const iso = target instanceof HTMLElement ? target.dataset["date"] : undefined;
  return iso === undefined ? null : Temporal.PlainDate.from(iso);
};

const focusDay = (grid: HTMLElement | null, day: Temporal.PlainDate) => {
  grid?.querySelector<HTMLElement>(`[data-date="${day.toString()}"]`)?.focus();
};

function useGrid(
  calendar: ReturnType<typeof useCalendar>,
  firstDay: number,
  picker: DatePickerContextValue | null,
) {
  const { focused, setFocused, outside, choose } = calendar;
  const grid = useRef<HTMLTableElement>(null);
  const open = picker?.open === true;
  const focusOnOpen = useEffectEvent(() => {
    if (picker?.canFocus() === true) focusDay(grid.current, focused);
  });
  useEffect(() => {
    if (open) focusOnOpen();
  }, [open]);
  return {
    grid,
    onKeyDown: (event: KeyboardEvent<HTMLTableElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        choose(focused, event.nativeEvent);
        return;
      }
      const target = keyTarget(event, focused, firstDay);
      if (target === null) return;
      event.preventDefault();
      if (outside(target)) return;
      // The day may be in a month that isn't drawn yet.
      flushSync(() => {
        setFocused(target);
      });
      focusDay(grid.current, target);
    },
    onClick: (event: MouseEvent<HTMLTableElement>) => {
      const day = dayOf(event.target);
      if (day !== null) choose(day, event.nativeEvent);
    },
    onFocus: (event: FocusEvent<HTMLTableElement>) => {
      const day = dayOf(event.target);
      if (day !== null && !day.equals(focused)) setFocused(day);
    },
  };
}

/**
 * A month grid for choosing one date while seeing the days around it. To type a known date, use
 * DateField; for a field with a calendar on demand, DatePicker.
 */
export function Calendar({
  labels,
  locale,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  isDateUnavailable,
  ...rest
}: CalendarProps) {
  const picker = use(DatePickerContext);
  const formats = dateFormats(picker === null ? locale : picker.locale);
  const limits = picker ?? { value, min, max, isDateUnavailable };
  const calendar = useCalendar({ defaultValue, onValueChange, ...limits }, picker);
  const { focused, setFocused, outside } = calendar;
  const headingId = useId();
  const handlers = useGrid(calendar, formats.firstDay, picker);
  const first = focused.with({ day: 1 });
  return (
    <fieldset {...mergeProps({ className: styles["root"] }, rest)}>
      <Header
        names={useLabels("calendar", calendarLabels, labels)}
        heading={formats.heading(first)}
        headingId={headingId}
        before={!outside(first.subtract({ days: 1 }))}
        after={!outside(first.add({ months: 1 }))}
        page={(months) => {
          setFocused(clamp(focused.add({ months }), limits.min, limits.max));
        }}
      />
      <Grid
        {...handlers}
        headingId={headingId}
        formats={formats}
        focused={focused}
        selected={calendar.selected}
        today={calendar.today}
        unavailable={calendar.unavailable}
      />
    </fieldset>
  );
}
