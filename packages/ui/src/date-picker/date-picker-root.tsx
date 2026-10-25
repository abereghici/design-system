"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";

import { DateFieldFrame } from "../date-field/date-field.tsx";
import type { DateFieldChangeEventDetails, DateFieldProps } from "../date-field/date-field.tsx";
import type { DatePickerContextValue, Temporal } from "../date/date.ts";
import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useFloating } from "../floating/floating.ts";
import type { ChangeEventDetails as FloatingDetails, Floating } from "../floating/floating.ts";

import { PanelContext } from "./date-picker-panel.tsx";
import { Trigger } from "./date-picker-trigger.tsx";

/** `cancel()`: keeps the previous value; after a day press the panel stays open. */
export type ChangeEventDetails = Details<DateFieldChangeEventDetails["reason"] | "day-press">;

export type OpenChangeEventDetails = FloatingDetails<
  "trigger-press" | "outside-press" | "escape-key" | "focus-out" | "day-press" | "none"
>;

type Unavailable =
  | { isDateUnavailable?: undefined; unavailableMessage?: undefined }
  | { isDateUnavailable: (date: Temporal.PlainDate) => boolean; unavailableMessage: string };

export type RootProps = Omit<DateFieldProps, "value" | "defaultValue" | "onValueChange"> &
  Unavailable & {
    /**
     * Days that can't be chosen, such as weekends or booked dates; typing one marks the field
     * invalid.
     */
    isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
    /** The error for a typed day that can't be chosen, such as "This date is not available". */
    unavailableMessage?: string | undefined;
    /** The chosen date, when your state holds it; `null` is no date. */
    value?: Temporal.PlainDate | null | undefined;
    /** The starting value when it holds its own state. */
    defaultValue?: Temporal.PlainDate | null | undefined;
    /** Called before the date changes; `details.cancel()` keeps the previous one. */
    onValueChange?:
      | ((value: Temporal.PlainDate | null, details: ChangeEventDetails) => void)
      | undefined;
    /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
    open?: boolean | undefined;
    /** Opens it on the first render when it holds its own state. */
    defaultOpen?: boolean | undefined;
    /** Called before it opens or closes; `details.cancel()` keeps it as it is. */
    onOpenChange?: ((open: boolean, details: OpenChangeEventDetails) => void) | undefined;
    /** The name of the calendar button and of the panel it opens, such as "Choose date". */
    triggerLabel: string;
    /** The `DatePicker.Content`. */
    children?: ReactNode;
  };

function useValue({ value, defaultValue = null, onValueChange }: RootProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;
  const change = (
    date: Temporal.PlainDate | null,
    reason: ChangeEventDetails["reason"],
    event: Event,
  ) => {
    const accepted = requestChange(onValueChange, date, reason, event);
    if (accepted) setUncontrolled(date);
    return accepted;
  };
  const reset = () => {
    setUncontrolled(defaultValue);
  };
  return { current, change, reset };
}

function pickerOf(
  floating: Floating,
  date: ReturnType<typeof useValue>,
  { min, max, isDateUnavailable, locale }: RootProps,
): DatePickerContextValue {
  return {
    open: floating.open,
    locale,
    value: date.current,
    min,
    max,
    isDateUnavailable,
    choose: (day, event) => {
      if (date.current?.equals(day) === true || date.change(day, "day-press", event)) {
        floating.toggle(false, "day-press", event);
      }
    },
    canFocus: () => {
      const focus = document.activeElement;
      return (
        focus === document.body ||
        focus?.getAttribute("commandfor") === floating.contentId ||
        document.getElementById(floating.contentId)?.contains(focus) === true
      );
    },
  };
}

/**
 * A date field with a button that opens a month: type the date, or pick it. Put a `<Calendar />` in
 * `DatePicker.Content`; it follows the DatePicker's value and limits. For dates people type from
 * memory (birth dates), use DateField; for an always visible month, Calendar.
 */
export function Root(props: RootProps) {
  const { defaultValue, open, defaultOpen, onOpenChange, isDateUnavailable, ...rest } = props;
  const { triggerLabel: name, disabled, children, ...field } = rest;
  const date = useValue(props);
  const trigger = useRef<HTMLButtonElement>(null);
  const floating = useFloating("Popover", { open, defaultOpen, onOpenChange });
  const panel = { floating, name, trigger };
  return (
    <DateFieldFrame
      {...field}
      disabled={disabled}
      value={date.current}
      defaultValue={defaultValue}
      onValueChange={(next, details) => {
        if (!date.change(next, details.reason, details.event)) details.cancel();
      }}
      isDateUnavailable={isDateUnavailable}
      onFormReset={date.reset}
      end={
        <Trigger
          panel={panel}
          value={date.current}
          locale={field.locale}
          disabled={disabled === true}
        />
      }
    >
      <PanelContext value={{ ...panel, picker: pickerOf(floating, date, props) }}>
        {children}
      </PanelContext>
    </DateFieldFrame>
  );
}
