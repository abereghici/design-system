import { useState } from "react";
import type { MouseEvent, MouseEventHandler } from "react";

import { dispatchFeedback } from "../../feedback-event/feedback-event.ts";
import { requestChange } from "../change-request/change-request.ts";
import type { ChangeEventDetails as Details } from "../change-request/change-request.ts";
import { composeEventHandlers } from "../compose-event-handlers/compose-event-handlers.ts";
import { useControllableState } from "../uncontrolled-state/use-controllable-state.ts";

/** The values as a list: none for `undefined`, `null` or `""`, else one or several. */
export const valuesOf = (value: string | null | ReadonlyArray<string> | undefined) =>
  value === undefined || value === null || value === ""
    ? []
    : typeof value === "string"
      ? [value]
      : value;

/** The list with `item` added, or removed if it was there. */
export const toggled = (list: ReadonlyArray<string>, item: string) =>
  list.includes(item) ? list.filter((each) => each !== item) : [...list, item];

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
      dispatchFeedback(event.currentTarget, "ab-toggle", { component, userInitiated: true });
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
  const [root, setRoot] = useState<HTMLFieldSetElement | null>(null);
  const [current, change] = useControllableState(
    value,
    defaultValue,
    onValueChange,
    root?.form ?? null,
  );

  function select(next: string, event: MouseEvent<HTMLInputElement>) {
    if (next === current) return;

    if (!change(next, "none", event.nativeEvent)) {
      event.preventDefault();

      return;
    }

    dispatchFeedback(event.currentTarget, "ab-toggle", { component, userInitiated: true });
  }

  return { current, select, setRoot };
}
