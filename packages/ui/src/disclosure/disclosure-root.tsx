"use client";

import type { ComponentProps, SyntheticEvent } from "react";

import "@abereghici/tokens/components/disclosure.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import type { ToggleFeedbackEvent } from "../feedback-event/feedback-event.ts";
import type { ChangeEventDetails as EventDetails } from "../internal/change-request/change-request.ts";
import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import styles from "./disclosure.module.css";

/**
 * `"trigger-press"`: a Trigger click, Enter or Space. `"none"`: the browser opened or closed it
 * (find-in-page, fragment navigation, another Disclosure with the same `name` opening).
 * `cancel()`: keeps it as it was. Only a `"trigger-press"` can be cancelled: the browser has already
 * acted on the others.
 */
export type ChangeEventDetails = EventDetails<"trigger-press" | "none">;

interface DisclosureState {
  readonly state: { readonly open: boolean };
  readonly actions: {
    readonly change: (open: boolean, event: SyntheticEvent<HTMLElement>) => void;
  };
  readonly meta: { readonly component: Component };
}

export const [DisclosureContext, useDisclosure] = createSafeContext<DisclosureState>(
  "Disclosure.Root or Accordion.Item",
);

export type RootProps = Omit<ComponentProps<"details">, "open"> & {
  /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
  open?: boolean;
  /** Opens it on the first render when it holds its own state. */
  defaultOpen?: boolean;
  /** Called before it opens or closes, with the state it would have. */
  onOpenChange?: (open: boolean, details: ChangeEventDetails) => void;
} & ({ open?: never } | { defaultOpen?: never });

type Component = ToggleFeedbackEvent["detail"]["component"];

/** The `<details>` behind Disclosure.Root and Accordion.Item; `component` names it in `ab-toggle`. */
export function DisclosureRoot({
  component,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: RootProps & { component: Component }) {
  const [current, request, set] = useControllableState(open, defaultOpen, onOpenChange);

  function change(next: boolean, event: SyntheticEvent<HTMLElement>) {
    const pressed = event.type === "click";

    if (request(next, pressed ? "trigger-press" : "none", event.nativeEvent)) {
      if (pressed)
        dispatchFeedback(event.currentTarget, "ab-toggle", { component, userInitiated: true });
    } else if (!pressed) {
      // The browser opened it already, for find-in-page or a fragment link; only a press can wait.
      set(next);
    }
  }

  return (
    <DisclosureContext
      value={{ state: { open: current }, actions: { change }, meta: { component } }}
    >
      <details
        {...mergeProps(
          {
            className: styles["root"],
            onToggle: (event: SyntheticEvent<HTMLDetailsElement>) => {
              if (event.currentTarget.open !== current) change(!current, event);
            },
          },
          props,
        )}
        open={current}
      />
    </DisclosureContext>
  );
}

/**
 * A single section of secondary content that its Trigger shows and hides, such as advanced settings.
 * Enter and Space toggle it, the browser's find-in-page opens it when it holds a match, and every
 * press dispatches a bubbling `ab-toggle`. Disclosures that share a `name` open one at a time. For
 * a stack of sections, use Accordion; for peer views of the same place, Tabs.
 *
 * Tier 1: works before hydration.
 */
export function Root(props: RootProps) {
  return <DisclosureRoot component="Disclosure" {...props} />;
}
