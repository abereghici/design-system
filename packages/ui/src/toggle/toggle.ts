import type { KeyboardEvent, MouseEvent, MouseEventHandler, PointerEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";

export interface ChangeEventDetails {
  readonly reason: "none";
  readonly event: Event;
  /** Keeps the previous state: the browser restores it once the click is cancelled. */
  readonly cancel: () => void;
}

export function changeDetails(event: MouseEvent): ChangeEventDetails {
  return {
    reason: "none",
    event: event.nativeEvent,
    cancel: () => {
      event.preventDefault();
    },
  };
}

/**
 * The input's `click` handler. The browser has already flipped the checkedness when it runs, and
 * restores it if the click is cancelled.
 */
export function toggleClick(
  component: "Checkbox" | "Switch",
  disabled: boolean,
  onClick: MouseEventHandler<HTMLInputElement> | undefined,
  onCheckedChange: ((checked: boolean, details: ChangeEventDetails) => void) | undefined,
): MouseEventHandler<HTMLInputElement> {
  return (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    onCheckedChange?.(event.currentTarget.checked, changeDetails(event));
    if (!event.defaultPrevented) {
      dispatchFeedback(event.currentTarget, "ab-toggle", { component, reason: "user" });
    }
  };
}

/** Marks pointer-initiated changes with `data-pointer`, so keyboard changes skip the motion. */
export const pointerMarker = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.dataset["pointer"] = "";
  },
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
    delete event.currentTarget.dataset["pointer"];
  },
};

// WebKit doesn't swap Left and Right for native radios in RTL (Chromium and Firefox do). Inside a Toolbar the Toolbar owns the arrow keys.
export function followVisualDirection(event: KeyboardEvent<HTMLElement>) {
  const step = event.key === "ArrowLeft" ? 1 : event.key === "ArrowRight" ? -1 : 0;
  const group = event.currentTarget;
  if (step === 0 || event.defaultPrevented || !group.matches(":dir(rtl)")) return;
  if (group.closest('[role="toolbar"]') !== null) return;
  if (!(event.target instanceof HTMLInputElement)) return;
  event.preventDefault();
  const radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const next = radios.at((radios.indexOf(event.target) + step) % radios.length);
  next?.focus();
  next?.click();
}
