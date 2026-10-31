"use client";

import { use, useState } from "react";

import "@abereghici/tokens/components/range-calendar.css";

import { Month } from "../calendar/calendar-month.tsx";
import type { CalendarProps } from "../calendar/calendar.tsx";
import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { DateRangePickerContext, Temporal } from "../internal/date/date.ts";
import type { DateRange } from "../internal/date/date.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

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

const ordered = (a: Temporal.PlainDate, b: Temporal.PlainDate): DateRange =>
  Temporal.PlainDate.compare(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };

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
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const own = { value: value === undefined ? uncontrolled : value, min, max, isDateUnavailable };
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
        const current = limits.value;

        setAnchor(null);

        if (picker !== null) picker.choose(range, event);
        else if (
          !(current?.start.equals(range.start) === true && current.end.equals(range.end)) &&
          requestChange(onValueChange, range, "day-press", event)
        ) {
          setUncontrolled(range);
        }
      }}
    />
  );
}
