"use client";

import type { ComponentProps, KeyboardEvent } from "react";

import "@abereghici/tokens/components/tabs.css";

import { chain } from "../internal/chain/chain.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { useTabs } from "./tabs-root.tsx";
import styles from "./tabs.module.css";

const steps: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 };

const listOf = (trigger: HTMLElement) => trigger.closest<HTMLElement>('[role="tablist"]');

function moveSelection(event: KeyboardEvent<HTMLButtonElement>) {
  const list = listOf(event.currentTarget);

  if (list === null) return;

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

/** A tab that shows the Content with the same `value`. */
export function Trigger({ value, onClick, onKeyDown, ...props }: TriggerProps) {
  const tabs = useTabs("Tabs.Trigger");
  const selected = value === tabs.state.value;

  return (
    <button
      {...mergeProps({ className: styles["trigger"] }, props)}
      type="button"
      role="tab"
      id={`${tabs.meta.id}-trigger-${value}`}
      aria-controls={`${tabs.meta.id}-content-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onKeyDown={chain(onKeyDown, moveSelection)}
      onClick={chain(onClick, (event) => {
        tabs.actions.select(value, event);
      })}
    />
  );
}
