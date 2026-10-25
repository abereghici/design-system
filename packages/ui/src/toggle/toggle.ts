import type { KeyboardEvent, MouseEventHandler, PointerEvent } from "react";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";

/** `cancel()`: keeps the previous state: the browser restores it once the click is cancelled. */
export type ChangeEventDetails = Details<"none">;

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
    if (!requestChange(onCheckedChange, event.currentTarget.checked, "none", event.nativeEvent)) {
      event.preventDefault();
    }
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
