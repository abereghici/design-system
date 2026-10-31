import { useState } from "react";
import type { MouseEvent, MouseEventHandler } from "react";

import { composeEventHandlers, dispatchFeedback, requestChange } from "../../events/events.ts";
import type { ChangeEventDetails as Details } from "../../events/events.ts";
import { useEvent } from "../../events/use-event.ts";

/** `cancel()`: keeps the previous state: the browser restores it once the click is cancelled. */
export type ChangeEventDetails = Details<"none">;

export function preventDefault(event: { preventDefault: () => void }) {
  event.preventDefault();
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
  return composeEventHandlers(disabled ? preventDefault : onClick, (event) => {
    if (requestChange(onCheckedChange, event.currentTarget.checked, "none", event.nativeEvent)) {
      dispatchFeedback(event.currentTarget, "ab-toggle", { component, reason: "user" });
    } else {
      event.preventDefault();
    }
  });
}

/**
 * The chosen radio of a group, held by the group unless `value` is given, and back to
 * `defaultValue` when the form resets. `select` is each radio's `click` handler; `setRoot` is the
 * group element's ref.
 */
export function useRadioChoice(
  component: "RadioGroup" | "SegmentedControl",
  value: string | null | undefined,
  defaultValue: string | null,
  onValueChange: ((value: string, details: ChangeEventDetails) => void) | undefined,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [root, setRoot] = useState<HTMLFieldSetElement | null>(null);
  const current = value === undefined ? uncontrolled : value;

  useEvent(
    "reset",
    () => {
      setUncontrolled(defaultValue);
    },
    root?.form ?? null,
  );

  function select(next: string, event: MouseEvent<HTMLInputElement>) {
    if (next === current) return;

    if (!requestChange(onValueChange, next, "none", event.nativeEvent)) {
      event.preventDefault();

      return;
    }

    setUncontrolled(next);
    dispatchFeedback(event.currentTarget, "ab-toggle", { component, reason: "user" });
  }

  return { current, select, setRoot };
}
