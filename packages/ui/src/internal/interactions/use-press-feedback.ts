import { createContext, use } from "react";
import type { MouseEvent } from "react";

import { dispatchFeedback } from "../utils/dispatch-feedback.ts";

/**
 * Whether a Button or IconButton dispatches its own `ab-press`. A Part built on one turns it off
 * when it reports what the press means, as Dialog.Close does with `ab-dismiss`, so a press
 * dispatches one Feedback event.
 */
export const PressFeedbackContext = createContext(true);

type Component = GlobalEventHandlersEventMap["ab-press"]["detail"]["component"];

/** The handler that dispatches a press's `ab-press`, unless a PressFeedbackContext turns it off. */
export function usePressFeedback(component: Component) {
  const reports = use(PressFeedbackContext);

  return (event: MouseEvent) => {
    if (reports)
      dispatchFeedback(event.currentTarget, "ab-press", { component, userInitiated: true });
  };
}
