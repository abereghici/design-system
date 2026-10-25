"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";

import { DateFieldFrame } from "../date-field/date-field.tsx";
import type { DateFieldChangeEventDetails, DateFieldProps } from "../date-field/date-field.tsx";
import type { DatePickerContextValue, Temporal } from "../date/date.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { byId, useFloating } from "../floating/floating.ts";
import type { ChangeEventDetails as FloatingDetails, Floating } from "../floating/floating.ts";
import { useLocale } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";
import { datePicker as datePickerLabels } from "../provider/locales/en-US/date-picker.ts";
import { pointerMarker } from "../toggle/toggle.ts";

import { PanelContext, Trigger } from "./panel.tsx";

/** `cancel()`: keeps the previous value; after a day press the panel stays open. */
export type ChangeEventDetails = Details<DateFieldChangeEventDetails["reason"] | "day-press">;

export type OpenChangeEventDetails = FloatingDetails<
  "trigger-press" | "outside-press" | "escape-key" | "focus-out" | "day-press" | "none"
>;

export interface RootProps extends Omit<
  DateFieldProps,
  "value" | "defaultValue" | "onValueChange" | "labels"
> {
  /** The chosen date, when your state holds it; `null` is no date. */
  value?: Temporal.PlainDate | null | undefined;
  /** The starting value when it holds its own state. */
  defaultValue?: Temporal.PlainDate | null | undefined;
  /** Called before the date changes; `details.cancel()` keeps the previous one. */
  onValueChange?:
    | ((value: Temporal.PlainDate | null, details: ChangeEventDetails) => void)
    | undefined;
  /**
   * Days that can't be chosen, such as weekends or booked dates; typing one marks the field
   * invalid.
   */
  isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
  /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
  open?: boolean | undefined;
  /** Opens it on the first render when it holds its own state. */
  defaultOpen?: boolean | undefined;
  /** Called before it opens or closes; `details.cancel()` keeps it as it is. */
  onOpenChange?: ((open: boolean, details: OpenChangeEventDetails) => void) | undefined;
  /** Replaces the built-in text of the Provider's locale, for this instance only. */
  labels?: Partial<Labels["datePicker"] & Labels["dateField"]> | undefined;
  /** The `DatePicker.Content`. */
  children?: ReactNode;
}

function useValue({ value, defaultValue = null, onValueChange }: RootProps) {
  const [own, setOwn] = useState(defaultValue);
  const current = value === undefined ? own : value;
  const change = (
    date: Temporal.PlainDate | null,
    reason: ChangeEventDetails["reason"],
    event: Event,
    onCancel?: () => void,
  ) => {
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
      onCancel?.();
    };
    onValueChange?.(date, { reason, event, cancel });
    if (!cancelled) setOwn(date);
    return !cancelled;
  };
  const reset = () => {
    setOwn(defaultValue);
  };
  return { current, change, reset };
}

function pickerOf(
  floating: Floating,
  date: ReturnType<typeof useValue>,
  { min, max, isDateUnavailable }: RootProps,
): DatePickerContextValue {
  return {
    open: floating.open,
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
        focus?.getAttribute("aria-controls") === floating.contentId ||
        byId(floating.contentId)?.contains(focus) === true
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
  const { labels, disabled, children, ...field } = rest;
  const locale = useLocale();
  const name =
    labels?.chooseDate ?? locale.labels.datePicker?.chooseDate ?? datePickerLabels.chooseDate;
  const date = useValue(props);
  const trigger = useRef<HTMLButtonElement>(null);
  const fieldBox = () => trigger.current?.closest("fieldset") ?? null;
  const floating = useFloating("Popover", { open, defaultOpen, onOpenChange }, fieldBox);
  const panel = { floating, name, trigger };
  return (
    <DateFieldFrame
      {...field}
      disabled={disabled}
      value={date.current}
      defaultValue={defaultValue}
      onValueChange={(next, details) => {
        date.change(next, details.reason, details.event, details.cancel);
      }}
      isDateUnavailable={isDateUnavailable}
      labels={labels}
      onFormReset={date.reset}
      onPointerDown={(event) => {
        field.onPointerDown?.(event);
        pointerMarker.onPointerDown(event);
      }}
      onKeyDown={(event) => {
        field.onKeyDown?.(event);
        pointerMarker.onKeyDown(event);
      }}
      end={
        <Trigger
          panel={panel}
          value={date.current}
          disabled={disabled === true}
          fieldBox={fieldBox}
        />
      }
    >
      <PanelContext value={{ ...panel, picker: pickerOf(floating, date, props) }}>
        {children}
      </PanelContext>
    </DateFieldFrame>
  );
}

export { Content } from "./panel.tsx";
export type { ContentProps } from "./panel.tsx";
