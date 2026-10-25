import type { DOMAttributes, KeyboardEvent, MouseEventHandler, PointerEvent } from "react";

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
    // A canceled click restores the input's checkedness (HTML legacy-canceled-activation behavior).
    if (!event.defaultPrevented) {
      dispatchFeedback(event.currentTarget, "ab-toggle", { component, reason: "user" });
    }
  };
}

/** Marks pointer-initiated changes with `data-pointer`, so keyboard changes skip the motion; `props`' own handlers run first. */
export function pointerMarker<Element extends HTMLElement>(
  props: Pick<DOMAttributes<Element>, "onPointerDown" | "onKeyDown"> = {},
) {
  return {
    onPointerDown: (event: PointerEvent<Element>) => {
      props.onPointerDown?.(event);
      event.currentTarget.dataset["pointer"] = "";
    },
    onKeyDown: (event: KeyboardEvent<Element>) => {
      props.onKeyDown?.(event);
      delete event.currentTarget.dataset["pointer"];
    },
  };
}

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
