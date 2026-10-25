"use client";

import type { ComponentProps, KeyboardEvent } from "react";

import { mergeProps } from "../slot/slot.tsx";

import { useTabs } from "./tabs-root.tsx";
import styles from "./tabs.module.css";

const steps: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 };

const listOf = (trigger: HTMLElement) => trigger.closest<HTMLElement>('[role="tablist"]');

function moveSelection(event: KeyboardEvent<HTMLButtonElement>) {
  const list = listOf(event.currentTarget);
  if (list === null) return;
  delete list.dataset["pointer"];
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]:enabled')];
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

export interface TriggerProps extends Omit<ComponentProps<"button">, "type" | "role"> {
  /** Pairs the Trigger with its Content; use one word with no spaces. */
  value: string;
}

export function Trigger({ value, onClick, onPointerDown, onKeyDown, ...props }: TriggerProps) {
  const tabs = useTabs("Trigger");
  const selected = value === tabs.value;
  return (
    <button
      {...mergeProps({ className: styles["trigger"] }, props)}
      type="button"
      role="tab"
      id={`${tabs.id}-trigger-${value}`}
      aria-controls={`${tabs.id}-content-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
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
