import { createContext, use } from "react";
import type { MouseEvent } from "react";

import { chain } from "../utils/chain.ts";
import { dispatchFeedback } from "../utils/dispatch-feedback.ts";

import { useButton } from "./use-button.ts";

/**
 * Whether a Button or IconButton dispatches its own `ab-press`. A Part built on one turns it off
 * when it reports what the press means, as Dialog.Close does with `ab-dismiss`, so a press
 * dispatches one Feedback event.
 */
export const PressFeedbackContext = createContext(true);

interface PressButtonOptions<Target extends Element> {
  /** Disabled or busy: it stays focusable, is announced as unavailable, and presses do nothing. */
  readonly disabled: boolean;
  /** The consumer's `onClick`. */
  readonly onClick: ((event: MouseEvent<Target>) => void) | undefined;
}

/**
 * A Button's or IconButton's own props: a press runs the consumer's `onClick`, then dispatches
 * `ab-press`, unless a PressFeedbackContext turns it off.
 */
export function usePressButton<Target extends Element>(
  component: GlobalEventHandlersEventMap["ab-press"]["detail"]["component"],
  { disabled, onClick }: PressButtonOptions<Target>,
) {
  const reports = use(PressFeedbackContext);

  return useButton<Target>({
    disabled,
    onClick: chain(onClick, (event) => {
      if (reports)
        dispatchFeedback(event.currentTarget, "ab-press", { component, userInitiated: true });
    }),
  });
}
