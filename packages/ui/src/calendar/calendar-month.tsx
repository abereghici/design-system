import { useEffect, useEffectEvent, useId, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import type { ComponentProps, FocusEvent, KeyboardEvent, MouseEvent } from "react";

import "@abereghici/tokens/components/calendar.css";

import { ordered, Temporal, useDateFormats } from "../internal/date/date.ts";
import type { DateRange } from "../internal/date/date.ts";
import { sharedListener } from "../internal/dom-event/shared-listener.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { Grid, keyTarget } from "./calendar-grid.tsx";
import { Header } from "./calendar-header.tsx";
import styles from "./calendar.module.css";

export interface Limits {
  readonly min?: Temporal.PlainDate | undefined;
  readonly max?: Temporal.PlainDate | undefined;
  readonly isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
}

export interface MonthProps extends Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onChange" | "role" | "children" | "disabled" | "name" | "form"
> {
  readonly limits: Limits;
  readonly previousMonthLabel: string;
  readonly nextMonthLabel: string;
  /** The chosen days; while `anchor` is set, the days from it to the focused one instead. */
  readonly selection: DateRange | null;
  readonly anchor?: Temporal.PlainDate | null | undefined;
  /** Called with a day that can be chosen, on a press or Enter. */
  readonly choose: (date: Temporal.PlainDate, event: Event) => void;
  /** Whether the picker around it is open; focus moves in on each open. */
  readonly picker: { readonly open: boolean; readonly canFocus: () => boolean } | null;
}

const onFocusIn = sharedListener("focusin", () => document);

const clamp = (date: Temporal.PlainDate, { min, max }: Limits) => {
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

function useFocused(limits: Limits, selection: DateRange | null, picker: MonthProps["picker"]) {
  const today = useToday();
  const start = clamp(selection?.start ?? today, limits);
  const [userFocus, setFocused] = useState<Temporal.PlainDate | null>(null);
  const open = picker?.open === true;
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) setFocused(null);
  }

  const focused = userFocus === null ? start : clamp(userFocus, limits);
  const outside = (date: Temporal.PlainDate) => !clamp(date, limits).equals(date);
  const unavailable = (date: Temporal.PlainDate) =>
    outside(date) || limits.isDateUnavailable?.(date) === true;

  return { today, focused, setFocused, outside, unavailable };
}

const dayOf = (target: EventTarget) => {
  const iso = target instanceof HTMLElement ? target.dataset["date"] : undefined;

  return iso === undefined ? null : Temporal.PlainDate.from(iso);
};

const focusDay = (grid: HTMLElement | null, day: Temporal.PlainDate) => {
  grid?.querySelector<HTMLElement>(`[data-date="${day.toString()}"]`)?.focus();
};

function useGrid(
  month: ReturnType<typeof useFocused>,
  firstDay: number,
  { picker, choose }: Pick<MonthProps, "picker" | "choose">,
) {
  const { focused, setFocused, outside, unavailable } = month;
  const grid = useRef<HTMLTableElement>(null);
  const open = picker?.open === true;
  const focusOnOpen = useEffectEvent(() => {
    if (picker?.canFocus() === true) focusDay(grid.current, focused);
  });

  useEffect(() => {
    if (open) focusOnOpen();
  }, [open]);

  const press = (date: Temporal.PlainDate, event: Event) => {
    setFocused(date);

    if (!unavailable(date)) choose(date, event);
  };

  return {
    grid,
    onKeyDown: (event: KeyboardEvent<HTMLTableElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        press(focused, event.nativeEvent);

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

      if (day !== null) press(day, event.nativeEvent);
    },
    onFocus: (event: FocusEvent<HTMLTableElement>) => {
      const day = dayOf(event.target);

      if (day !== null && !day.equals(focused)) setFocused(day);
    },
  };
}

/** A month grid between its month buttons; Calendar and RangeCalendar decide what a press chooses. */
export function Month({
  limits,
  previousMonthLabel,
  nextMonthLabel,
  selection,
  anchor,
  choose,
  picker,
  ...rest
}: MonthProps) {
  const formats = useDateFormats();
  const month = useFocused(limits, selection, picker);
  const { focused, setFocused, outside } = month;
  const headingId = useId();
  const handlers = useGrid(month, formats.firstDay, { picker, choose });
  const first = focused.with({ day: 1 });

  return (
    <fieldset {...mergeProps({ className: styles["root"] }, rest)}>
      <Header
        previousMonthLabel={previousMonthLabel}
        nextMonthLabel={nextMonthLabel}
        heading={formats.heading(first)}
        headingId={headingId}
        before={!outside(first.subtract({ days: 1 }))}
        after={!outside(first.add({ months: 1 }))}
        page={(months) => {
          setFocused(clamp(focused.add({ months }), limits));
        }}
      />
      <Grid
        {...handlers}
        headingId={headingId}
        formats={formats}
        focused={focused}
        selection={anchor === null || anchor === undefined ? selection : ordered(anchor, focused)}
        today={month.today}
        unavailable={month.unavailable}
      />
    </fieldset>
  );
}
