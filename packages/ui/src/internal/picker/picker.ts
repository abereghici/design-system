"use client";

import { useRef } from "react";
import type { RefObject } from "react";

import { createSafeContext } from "../create-safe-context/create-safe-context.ts";
import type { PickerContextValue, Temporal } from "../date/date.ts";
import { useOverlay } from "../overlay/overlay.ts";
import type { ChangeEventDetails, Overlay, OverlayOptions } from "../overlay/overlay.ts";

type OpenReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "focus-out"
  | "day-press"
  | "none";

export type OpenChangeEventDetails = ChangeEventDetails<OpenReason>;

/** What the calendar button and the panel share. */
export interface Panel {
  readonly overlay: Overlay;
  /** The name of both, such as "Choose date". */
  readonly name: string;
  readonly trigger: RefObject<HTMLButtonElement | null>;
}

export const [PanelContext, usePanel] = createSafeContext<Panel>(
  "DatePicker.Root or DateRangePicker.Root",
);

interface PickerOptions extends OverlayOptions<OpenReason> {
  readonly triggerLabel: string;
  readonly min?: Temporal.PlainDate | undefined;
  readonly max?: Temporal.PlainDate | undefined;
  readonly isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
}

/** The picker's value as its Calendar sees it; `change` is `false` when the change is refused. */
interface PickerValue<Value> {
  readonly current: Value | null;
  readonly change: (next: Value, reason: "day-press", event: Event) => boolean;
}

/** Whether focus is still where the open left it (the trigger, the panel or nowhere). */
const focusStayed = (trigger: HTMLButtonElement | null) => {
  const focus = document.activeElement;

  return (
    focus === document.body ||
    focus === trigger ||
    trigger?.commandForElement?.contains(focus) === true
  );
};

/**
 * A date picker's calendar button and panel: the open state and the trigger they share, the form
 * the picker's value resets with (the trigger's, which is its inputs'), and what the Calendar in
 * the panel reads, where choosing closes the panel unless the value refuses the change.
 */
export function usePicker(options: PickerOptions) {
  const { open, defaultOpen, onOpenChange, triggerLabel, min, max, isDateUnavailable } = options;
  const trigger = useRef<HTMLButtonElement>(null);
  const overlay = useOverlay(
    "Popover",
    { open, defaultOpen, onOpenChange },
    { returnTo: () => trigger.current },
  );

  return {
    panel: { overlay, name: triggerLabel, trigger },
    form: () => trigger.current?.form,
    calendar: <Value>(
      value: PickerValue<Value>,
      same: (current: Value | null, next: Value) => boolean,
    ): PickerContextValue<Value> => ({
      open: overlay.open,
      value: value.current,
      min,
      max,
      isDateUnavailable,
      choose: (next, event) => {
        if (same(value.current, next) || value.change(next, "day-press", event)) {
          overlay.toggle(false, "day-press", event);
        }
      },
      canFocus: () => focusStayed(trigger.current),
    }),
  };
}
