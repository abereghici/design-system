"use client";

import { use, useState } from "react";
import type { ComponentProps } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { DatePickerContext } from "../internal/date/date.ts";
import type { Temporal } from "../internal/date/date.ts";

import { Month } from "./calendar-month.tsx";

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
  /** The name of the previous-month button, such as "Previous month": it shows only an icon. */
  previousMonthLabel: string;
  /** The name of the next-month button, such as "Next month": it shows only an icon. */
  nextMonthLabel: string;
}

/**
 * A month grid for choosing one date while seeing the days around it. To type a known date, use
 * DateField; for a field with a calendar on demand, DatePicker; for a start and an end date,
 * RangeCalendar.
 *
 * Tier 2: shows its final content before hydration and works after it.
 */
export function Calendar({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  isDateUnavailable,
  ...rest
}: CalendarProps) {
  const picker = use(DatePickerContext);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const own = { value: value === undefined ? uncontrolled : value, min, max, isDateUnavailable };
  const limits = picker ?? own;
  const selected = limits.value;

  return (
    <Month
      {...rest}
      limits={limits}
      selection={selected === null ? null : { start: selected, end: selected }}
      picker={picker}
      choose={(date, event) => {
        if (picker !== null) picker.choose(date, event);
        else if (
          selected?.equals(date) !== true &&
          requestChange(onValueChange, date, "day-press", event)
        ) {
          setUncontrolled(date);
        }
      }}
    />
  );
}
