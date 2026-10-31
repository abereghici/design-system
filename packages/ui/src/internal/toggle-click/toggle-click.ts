import type { MouseEventHandler } from "react";

import { dispatchFeedback } from "../../feedback-event/feedback-event.ts";
import { requestChange } from "../change-request/change-request.ts";
import type { ChangeEventDetails as Details } from "../change-request/change-request.ts";
import { composeEventHandlers } from "../compose-event-handlers/compose-event-handlers.ts";

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
