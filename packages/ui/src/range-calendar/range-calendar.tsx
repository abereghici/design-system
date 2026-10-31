"use client";

import { use, useState } from "react";

import "@abereghici/tokens/components/range-calendar.css";

import { Month } from "../calendar/calendar-month.tsx";
import type { CalendarProps } from "../calendar/calendar.tsx";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { DateRangePickerContext, ordered, sameRange } from "../internal/date/date.ts";
import type { DateRange } from "../internal/date/date.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import styles from "./range-calendar.module.css";

export type { DateRange };

/** `cancel()`: keeps the previous range. */
export type RangeCalendarChangeEventDetails = Details<"day-press">;

export type RangeCalendarProps = Omit<CalendarProps, "value" | "defaultValue" | "onValueChange"> & {
  /** The chosen range, when your state holds it; `null` is no range. */
  value?: DateRange | null | undefined;
  /** The starting range when it holds its own state. */
  defaultValue?: DateRange | null | undefined;
  /** Called before a range is chosen, on the press of its second day; `details.cancel()` keeps the previous one. */
  onValueChange?:
    | ((value: DateRange, details: RangeCalendarChangeEventDetails) => void)
    | undefined;
} & ({ value: DateRange | null; defaultValue?: never } | { value?: never });

/**
 * A month grid for choosing a start and an end date, such as a stay: press the first day, then the
 * last, in either order; the days between follow focus until the second press. The arrow keys move
 * between days as in Calendar. For one date, use Calendar; for a field with typed dates, DateRangePicker.
 *
 * Tier 2: shows its final content before hydration and works after it.
 */
export function RangeCalendar({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  isDateUnavailable,
  className,
  ...rest
}: RangeCalendarProps) {
  const picker = use(DateRangePickerContext);
  const [current, request] = useControllableState(value, defaultValue, onValueChange);
  const own = { value: current, min, max, isDateUnavailable };
  const limits = picker ?? own;
  const [anchor, setAnchor] = useState<Temporal.PlainDate | null>(null);
  const open = picker?.open === true;
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    setAnchor(null);
  }

  return (
    <Month
      {...rest}
      {...mergeProps({ className: styles["root"] }, { className })}
      limits={limits}
      selection={limits.value}
      anchor={anchor}
      picker={picker}
      choose={(date, event) => {
        if (anchor === null) {
          setAnchor(date);

          return;
        }

        const range = ordered(anchor, date);

        setAnchor(null);

        if (picker !== null) picker.choose(range, event);
        else if (!sameRange(current, range)) request(range, "day-press", event);
      }}
    />
  );
}
