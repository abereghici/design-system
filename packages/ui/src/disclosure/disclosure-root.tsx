"use client";

import { createContext, use, useState } from "react";
import type { ComponentProps, SyntheticEvent } from "react";

import "@abereghici/tokens/components/disclosure.css";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import type { ChangeEventDetails as EventDetails, ToggleFeedbackEvent } from "../events/events.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./disclosure.module.css";

/**
 * `"trigger-press"`: a Trigger click, Enter or Space. `"none"`: the browser opened or closed it
 * (find-in-page, fragment navigation, another Disclosure with the same `name` opening).
 * `cancel()`: keeps it as it was. Only a `"trigger-press"` can be cancelled: the browser has already
 * acted on the others.
 */
export type ChangeEventDetails = EventDetails<"trigger-press" | "none">;

interface DisclosureState {
  readonly open: boolean;
  readonly change: (open: boolean, event: SyntheticEvent<HTMLElement>) => void;
}

export const DisclosureContext = createContext<DisclosureState | null>(null);

export function useDisclosure(part: string) {
  const disclosure = use(DisclosureContext);

  if (disclosure === null) throw new Error(`Disclosure.${part} must be inside Disclosure.Root`);

  return disclosure;
}

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
export function Details({
  component,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: RootProps & { component: Component }) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const current = open ?? uncontrolled;

  function change(next: boolean, event: SyntheticEvent<HTMLElement>) {
    const reason = event.type === "click" ? "trigger-press" : "none";
    const accepted = requestChange(onOpenChange, next, reason, event.nativeEvent);

    if (!accepted && reason === "trigger-press") return;

    setUncontrolled(next);

    if (reason === "trigger-press") {
      dispatchFeedback(event.currentTarget, "ab-toggle", { component, reason: "user" });
    }
  }

  return (
    <DisclosureContext value={{ open: current, change }}>
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
  return <Details component="Disclosure" {...props} />;
}
