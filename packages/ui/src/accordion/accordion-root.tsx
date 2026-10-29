"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, SyntheticEvent } from "react";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./accordion.module.css";

/**
 * `"trigger-press"`: a Trigger click, Enter or Space. `"none"`: the browser opened an Item
 * (find-in-page, fragment navigation). `cancel()`: keeps the open Items as they were. Only a
 * `"trigger-press"` can be cancelled: the browser has already revealed its match.
 */
export type ChangeEventDetails = Details<"trigger-press" | "none">;

interface AccordionState {
  readonly name: string | undefined;
  readonly value: readonly string[];
  readonly change: (item: string, open: boolean, event: SyntheticEvent<HTMLElement>) => void;
}

const AccordionContext = createContext<AccordionState | null>(null);

export const ItemContext = createContext<string | null>(null);

export interface RootProps extends Omit<ComponentProps<"div">, "defaultValue"> {
  /** Lets several Items stay open at once; by default opening one closes the other. */
  multiple?: boolean;
  /** The `value`s of the open Items, when your state holds them; one at most without `multiple`. */
  value?: ReadonlyArray<string>;
  /** The Items open on the first render when it holds its own state. */
  defaultValue?: ReadonlyArray<string>;
  /** Called before an Item opens or closes, with the open `value`s it would have. */
  onValueChange?: (value: string[], details: ChangeEventDetails) => void;
}

/**
 * Stacked sections of secondary content that open one at a time, or several with `multiple`. Enter
 * and Space toggle a section, the browser's find-in-page opens one with a match, and every press
 * dispatches a bubbling `ab-toggle`. Never hide a primary task inside one; for peer views of the
 * same place, use Tabs.
 */
export function Root({
  multiple = false,
  value,
  defaultValue = [],
  onValueChange,
  ...props
}: RootProps) {
  const name = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = multiple ? (value ?? uncontrolled) : (value ?? uncontrolled).slice(0, 1);

  function change(item: string, open: boolean, event: SyntheticEvent<HTMLElement>) {
    const next = open
      ? multiple
        ? [...current, item]
        : [item]
      : current.filter((v) => v !== item);
    const reason = event.type === "click" ? "trigger-press" : "none";
    const accepted = requestChange(onValueChange, next, reason, event.nativeEvent);

    if (!accepted && reason === "trigger-press") return;

    setUncontrolled(next);

    if (reason === "trigger-press") {
      dispatchFeedback(event.currentTarget, "ab-toggle", {
        component: "Accordion",
        reason: "user",
      });
    }
  }

  return (
    <AccordionContext value={{ name: multiple ? undefined : name, value: current, change }}>
      <div {...mergeProps({ className: styles["root"] }, props)} />
    </AccordionContext>
  );
}

export function useAccordion(part: string) {
  const accordion = use(AccordionContext);

  if (accordion === null) throw new Error(`Accordion.${part} must be inside Accordion.Root`);

  return accordion;
}
