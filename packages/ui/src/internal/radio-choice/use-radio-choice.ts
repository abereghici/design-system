import { useState } from "react";
import type { MouseEvent } from "react";

import { dispatchFeedback } from "../../feedback-event/feedback-event.ts";
import type { ChangeEventDetails } from "../change-request/change-request.ts";
import { useControllableState } from "../uncontrolled-state/use-controllable-state.ts";

/**
 * The chosen radio of a group, held by the group unless `value` is given, and back to
 * `defaultValue` when the form resets. `select` is each radio's `click` handler; `setRoot` is the
 * group element's ref.
 */
export function useRadioChoice(
  component: "RadioGroup" | "SegmentedControl",
  value: string | null | undefined,
  defaultValue: string | null,
  onValueChange: ((value: string, details: ChangeEventDetails<"none">) => void) | undefined,
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
