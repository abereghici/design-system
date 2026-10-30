"use client";

import { createContext, use, useId, useState } from "react";
import { flushSync } from "react-dom";
import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/tabs.css";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./tabs.module.css";

/**
 * `"none"`: a Trigger click or arrow key. `"find"`: the browser revealed a match in a hidden panel
 * (find-in-page, a link into it). `cancel()`: keeps the current tab; a revealed panel hides again.
 */
export type ChangeEventDetails = Details<"none" | "find">;

interface TabsState {
  readonly id: string;
  readonly value: string;
  readonly select: (value: string, event: MouseEvent<HTMLButtonElement>) => void;
  /** Answers whether the consumer accepted opening `value` for a match the browser revealed. */
  readonly reveal: (value: string, event: Event) => boolean;
}

const TabsContext = createContext<TabsState | null>(null);

export function useTabs(part: string) {
  const tabs = use(TabsContext);

  if (tabs === null) throw new Error(`Tabs.${part} must be inside Tabs.Root`);

  return tabs;
}

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
 */
export function Root({ value, defaultValue, onValueChange, ...props }: RootProps) {
  const id = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const current = value ?? uncontrolled;

  function select(next: string, event: MouseEvent<HTMLButtonElement>) {
    if (next === current) return;

    if (!requestChange(onValueChange, next, "none", event.nativeEvent)) return;

    setUncontrolled(next);

    const trigger = event.currentTarget;

    trigger.focus();
    trigger.scrollIntoView({ block: "nearest", inline: "nearest" });
    dispatchFeedback(trigger, "ab-toggle", { component: "Tabs", reason: "user" });
  }

  function reveal(next: string, event: Event) {
    // The browser shows the panel once `beforematch` returns: the tab switches in the same task, so
    // no frame paints two panels.
    return flushSync(() => {
      const accepted = requestChange(onValueChange, next, "find", event);

      if (accepted) setUncontrolled(next);

      return accepted;
    });
  }

  return (
    <TabsContext value={{ id, value: current, select, reveal }}>
      <div {...mergeProps({ className: styles["root"] }, props)} />
    </TabsContext>
  );
}
