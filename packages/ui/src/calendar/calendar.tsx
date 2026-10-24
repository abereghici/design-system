"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { ComponentProps, FocusEvent, KeyboardEvent, MouseEvent } from "react";

import { dateFormats, Temporal } from "../date/date.ts";
import { IconButton } from "../icon-button/icon-button.tsx";
import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import { useLocale } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";

import { Grid, keyTarget } from "./calendar-grid.tsx";
import styles from "./calendar.module.css";

export interface CalendarChangeEventDetails {
  readonly reason: "day-press";
  readonly event: Event;
  /** Keeps the previous value. */
  readonly cancel: () => void;
}

export interface CalendarProps extends Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onChange" | "role" | "children"
> {
  /** Controlled. `null` is no date. */
  value?: Temporal.PlainDate | null | undefined;
  defaultValue?: Temporal.PlainDate | null | undefined;
  onValueChange?:
    | ((value: Temporal.PlainDate, details: CalendarChangeEventDetails) => void)
    | undefined;
  /** Days outside are unavailable; Previous and Next stop at their months. */
  min?: Temporal.PlainDate | undefined;
  max?: Temporal.PlainDate | undefined;
  /** Unavailable days stay focusable and readable, but cannot be chosen. */
  isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
  /** Previous and Next names; fall back to the Provider's locale. */
  labels?: Partial<Labels["calendar"]> | undefined;
}

const onFocusIn = (listener: () => void) => {
  document.addEventListener("focusin", listener);
  return () => {
    document.removeEventListener("focusin", listener);
  };
};

const clamp = (date: Temporal.PlainDate, min?: Temporal.PlainDate, max?: Temporal.PlainDate) => {
  if (min !== undefined && Temporal.PlainDate.compare(date, min) < 0) return min;
  if (max !== undefined && Temporal.PlainDate.compare(date, max) > 0) return max;
  return date;
};

function useToday() {
  // The server renders UTC's date; the browser corrects it to its own time zone after hydration.
  const iso = useSyncExternalStore(
    onFocusIn,
    () => Temporal.Now.plainDateISO().toString(),
    () => Temporal.Now.plainDateISO("UTC").toString(),
  );
  return Temporal.PlainDate.from(iso);
}

function useCalendar({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  isDateUnavailable,
}: CalendarProps) {
  const today = useToday();
  const [own, setOwn] = useState(defaultValue);
  const selected = value === undefined ? own : value;
  const [focused, setFocused] = useState(() => clamp(selected ?? today, min, max));
  const outside = (date: Temporal.PlainDate) => clamp(date, min, max) !== date;
  const unavailable = (date: Temporal.PlainDate) =>
    outside(date) || isDateUnavailable?.(date) === true;
  const choose = (date: Temporal.PlainDate, event: Event) => {
    setFocused(date);
    if (unavailable(date) || selected?.equals(date) === true) return;
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    onValueChange?.(date, { reason: "day-press", event, cancel });
    if (!cancelled) setOwn(date);
  };
  return { today, selected, focused, setFocused, outside, unavailable, choose };
}

interface HeaderProps {
  readonly names: Labels["calendar"];
  readonly heading: string;
  readonly headingId: string;
  readonly before: boolean;
  readonly after: boolean;
  readonly page: (months: number) => void;
}

function Header({ names, heading, headingId, before, after, page }: HeaderProps) {
  return (
    <div className={styles["header"]}>
      <IconButton
        size="sm"
        aria-label={names.previousMonth}
        disabled={!before}
        onClick={() => {
          page(-1);
        }}
      >
        <ChevronRightIcon size="sm" className={styles["previous"]} />
      </IconButton>
      <h2 id={headingId} aria-live="polite" className={styles["heading"]}>
        {heading}
      </h2>
      <IconButton
        size="sm"
        aria-label={names.nextMonth}
        disabled={!after}
        onClick={() => {
          page(1);
        }}
      >
        <ChevronRightIcon size="sm" />
      </IconButton>
    </div>
  );
}

const dayOf = (target: EventTarget) => {
  const iso = target instanceof HTMLElement ? target.dataset["date"] : undefined;
  return iso === undefined ? null : Temporal.PlainDate.from(iso);
};

function useGrid(calendar: ReturnType<typeof useCalendar>, firstDay: number) {
  const { focused, setFocused, outside, choose } = calendar;
  const grid = useRef<HTMLTableElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-date="${focused.toString()}"]`)?.focus();
  }, [focused]);
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
      moved.current = true;
      setFocused(target);
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
  className,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  isDateUnavailable,
  ...rest
}: CalendarProps) {
  const locale = useLocale();
  const formats = dateFormats(locale.tag);
  const calendar = useCalendar({ value, defaultValue, onValueChange, min, max, isDateUnavailable });
  const { focused, setFocused, outside } = calendar;
  const headingId = useId();
  const handlers = useGrid(calendar, formats.firstDay);
  const first = focused.with({ day: 1 });
  return (
    <fieldset
      {...rest}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    >
      <Header
        names={{ ...locale.labels.calendar, ...labels }}
        heading={formats.heading(first)}
        headingId={headingId}
        before={!outside(first.subtract({ days: 1 }))}
        after={!outside(first.add({ months: 1 }))}
        page={(months) => {
          setFocused(clamp(focused.add({ months }), min, max));
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
