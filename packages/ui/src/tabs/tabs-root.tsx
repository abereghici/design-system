"use client";

import { useId } from "react";
import { flushSync } from "react-dom";
import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/tabs.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import styles from "./tabs.module.css";

/**
 * `"none"`: a Trigger click or arrow key. `"find"`: the browser revealed a match in a hidden panel
 * (find-in-page, a link into it). `cancel()`: keeps the current tab; a revealed panel hides again.
 */
export type ChangeEventDetails = Details<"none" | "find">;

interface TabsState {
  readonly state: { readonly value: string };
  readonly actions: {
    readonly select: (value: string, event: MouseEvent<HTMLButtonElement>) => void;
    /** Answers whether the consumer accepted opening `value` for a match the browser revealed. */
    readonly reveal: (value: string, event: Event) => boolean;
  };
  readonly meta: { readonly id: string };
}

export const [TabsContext, useTabs] = createSafeContext<TabsState>("Tabs.Root");

export type RootProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  /** The open tab's `value`, when your state holds it. */
  value?: string;
  /** The tab open on the first render when it holds its own state. */
  defaultValue?: string;
  /** Called before another tab opens; `details.cancel()` keeps the current one. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
} & ({ value: string; defaultValue?: never } | { defaultValue: string; value?: never });

/**
 * Peer sections of one place, one shown at a time. Arrow keys move and open (following the reading
 * direction), the browser's find-in-page opens the tab holding a match, and every press dispatches
 * a bubbling `ab-toggle`. For modes of the same content use SegmentedControl; to move between pages,
 * Navbar or Sidebar; for sections that open independently, Accordion.
 *
 * Tier 2: shows its final content before hydration and works after it.
 */
export function Root({ value, defaultValue, onValueChange, ...props }: RootProps) {
  const id = useId();
  const [current, request] = useControllableState(value, defaultValue ?? "", onValueChange);

  function select(next: string, event: MouseEvent<HTMLButtonElement>) {
    if (next === current || !request(next, "none", event.nativeEvent)) return;

    const trigger = event.currentTarget;

    trigger.focus();
    trigger.scrollIntoView({ block: "nearest", inline: "nearest" });
    dispatchFeedback(trigger, "ab-toggle", { component: "Tabs", userInitiated: true });
  }

  function reveal(next: string, event: Event) {
    // The browser shows the panel once `beforematch` returns: the tab switches in the same task, so
    // no frame paints two panels.
    return flushSync(() => request(next, "find", event));
  }

  return (
    <TabsContext value={{ state: { value: current }, actions: { select, reveal }, meta: { id } }}>
      <div {...mergeProps({ className: styles["root"] }, props)} />
    </TabsContext>
  );
}
