"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent } from "react";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import { join } from "../slot/slot.tsx";
import type { ChangeEventDetails } from "../toggle/toggle.ts";

import styles from "./tabs.module.css";

export type { ChangeEventDetails } from "../toggle/toggle.ts";

interface TabsState {
  readonly id: string;
  readonly value: string;
  readonly select: (value: string, event: MouseEvent<HTMLButtonElement>) => void;
}

const TabsContext = createContext<TabsState | null>(null);

function useTabs(part: string) {
  const tabs = use(TabsContext);
  if (tabs === null) throw new Error(`Tabs.${part} must be inside Tabs.Root`);
  return tabs;
}

export type RootProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  /** Called before the change commits; `details.cancel()` keeps the current tab. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
} & ({ value: string; defaultValue?: never } | { defaultValue: string; value?: never });

/**
 * Peer sections that share one context, one panel at a time. Arrow keys move and activate
 * (following the visual direction in RTL), and every committed change dispatches a bubbling
 * `ab-toggle`. For modes of the same content use SegmentedControl; to move between pages, Navbar or
 * Sidebar; for sections that open independently, Accordion.
 */
export function Root({ value, defaultValue, onValueChange, className, ...props }: RootProps) {
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
      <div {...props} className={join(styles["root"], className)} />
    </TabsContext>
  );
}

const steps: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 };

const listOf = (trigger: HTMLElement) => trigger.closest<HTMLElement>('[role="tablist"]');

function moveSelection(event: KeyboardEvent<HTMLButtonElement>) {
  const list = listOf(event.currentTarget);
  if (list === null) return;
  delete list.dataset["pointer"];
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const from = tabs.indexOf(event.currentTarget);
  const step = (steps[event.key] ?? 0) * (list.matches(":dir(rtl)") ? -1 : 1);
  const next =
    event.key === "Home"
      ? tabs[0]
      : event.key === "End"
        ? tabs.at(-1)
        : step === 0
          ? undefined
          : tabs.at((from + step) % tabs.length);
  if (next === undefined) return;
  event.preventDefault();
  next.click();
}

export type ListProps = ComponentProps<"div"> &
  ({ "aria-label": string } | { "aria-labelledby": string });

export function List({ className, ...props }: ListProps) {
  return <div {...props} role="tablist" className={join(styles["list"], className)} />;
}

export interface TriggerProps extends Omit<ComponentProps<"button">, "type" | "role"> {
  /** No whitespace: it becomes part of the element ids. */
  value: string;
}

export function Trigger({
  value,
  className,
  onClick,
  onPointerDown,
  onKeyDown,
  ...props
}: TriggerProps) {
  const tabs = useTabs("Trigger");
  const selected = value === tabs.value;
  return (
    <button
      {...props}
      type="button"
      role="tab"
      id={`${tabs.id}-trigger-${value}`}
      aria-controls={`${tabs.id}-content-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className={join(styles["trigger"], className)}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        const list = listOf(event.currentTarget);
        if (list !== null) list.dataset["pointer"] = "";
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        moveSelection(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        tabs.select(value, event);
      }}
    />
  );
}

export interface ContentProps extends ComponentProps<"div"> {
  value: string;
}

export function Content({ value, className, ...props }: ContentProps) {
  const tabs = useTabs("Content");
  return (
    <div
      tabIndex={0}
      {...props}
      role="tabpanel"
      id={`${tabs.id}-content-${value}`}
      aria-labelledby={`${tabs.id}-trigger-${value}`}
      hidden={value !== tabs.value}
      className={join(styles["content"], className)}
    />
  );
}
