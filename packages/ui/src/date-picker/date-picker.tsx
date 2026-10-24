"use client";

import { createContext, use, useRef, useState } from "react";
import type { ComponentProps, ReactNode, RefObject } from "react";

import { DateFieldFrame } from "../date-field/date-field.tsx";
import type { DateFieldChangeEventDetails, DateFieldProps } from "../date-field/date-field.tsx";
import { DatePickerContext } from "../date/date.ts";
import type { DatePickerContextValue, Temporal } from "../date/date.ts";
import { byId, rememberFocus, useFloating } from "../floating/floating.ts";
import type { ChangeEventDetails as FloatingDetails, Floating } from "../floating/floating.ts";
import { useLocale } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";
import { pointerMarker } from "../toggle/toggle.ts";

import { datePickerLabels } from "./labels.ts";
import { Trigger } from "./trigger.tsx";
import popoverStyles from "../popover/popover.module.css";
import styles from "./date-picker.module.css";

export interface ChangeEventDetails {
  readonly reason: DateFieldChangeEventDetails["reason"] | "day-press";
  readonly event: Event;
  /** Keeps the previous value; after a day press the panel stays open. */
  readonly cancel: () => void;
}

export type OpenChangeEventDetails = FloatingDetails<
  "trigger-press" | "outside-press" | "escape-key" | "focus-out" | "day-press" | "none"
>;

export interface RootProps extends Omit<
  DateFieldProps,
  "value" | "defaultValue" | "onValueChange" | "labels"
> {
  /** Controlled. `null` is no date. */
  value?: Temporal.PlainDate | null | undefined;
  defaultValue?: Temporal.PlainDate | null | undefined;
  onValueChange?:
    | ((value: Temporal.PlainDate | null, details: ChangeEventDetails) => void)
    | undefined;
  /** Unavailable in the Calendar; a typed unavailable date is invalid. */
  isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, details: OpenChangeEventDetails) => void) | undefined;
  /** Trigger, panel and field labels; fall back to the Provider's locale. */
  labels?: Partial<Labels["datePicker"] & Labels["dateField"]> | undefined;
  /** The `DatePicker.Content`. */
  children?: ReactNode;
}

interface Panel {
  readonly floating: Floating;
  readonly picker: DatePickerContextValue;
  readonly name: string;
  readonly trigger: RefObject<HTMLButtonElement | null>;
}

const PanelContext = createContext<Panel | null>(null);

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
 * A DateField with a trigger that opens a Calendar in a popover: type the date, or pick it from the
 * month. Put a `<Calendar />` in `DatePicker.Content`; it reads the value and limits from the
 * DatePicker. For dates people type from memory (birth dates), use DateField; for an always
 * visible month, Calendar.
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

export type ContentProps = Omit<
  ComponentProps<"dialog">,
  "id" | "open" | "popover" | "role" | "aria-label"
>;

/** The popover holding the Calendar. Its children mount on the first open, so they can be lazy. */
export function Content({ className, children, ...props }: ContentProps) {
  const panel = use(PanelContext);
  if (panel === null) throw new Error("DatePicker.Content must be inside DatePicker.Root");
  const { floating, picker, name, trigger } = panel;
  const { onBeforeToggle, ...native } = floating.contentProps;
  const [mounted, setMounted] = useState(false);
  if (floating.open && !mounted) setMounted(true);
  const base = `${popoverStyles["content"]} ${styles["content"]}`;
  return (
    <dialog
      {...props}
      {...native}
      aria-label={name}
      className={className === undefined ? base : `${base} ${className}`}
      onBeforeToggle={(event) => {
        onBeforeToggle(event);
        if (event.newState === "open") rememberFocus(floating.contentId, trigger.current);
      }}
    >
      {mounted && <DatePickerContext value={picker}>{children}</DatePickerContext>}
    </dialog>
  );
}
