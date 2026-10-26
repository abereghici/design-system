"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import { mergeProps } from "../slot/slot.tsx";
import type { ChangeEventDetails } from "../toggle/toggle.ts";

import styles from "./tabs.module.css";

interface TabsState {
  readonly id: string;
  readonly value: string;
  readonly select: (value: string, event: MouseEvent<HTMLButtonElement>) => void;
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
 * direction), and every change dispatches a bubbling `ab-toggle`. For modes of the same content use
 * SegmentedControl; to move between pages, Navbar or Sidebar; for sections that open independently,
 * Accordion.
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

  return (
    <TabsContext value={{ id, value: current, select }}>
      <div {...mergeProps({ className: styles["root"] }, props)} />
    </TabsContext>
  );
}
