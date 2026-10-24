"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, MouseEvent, SyntheticEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { ChevronDownIcon } from "../icon/icons/chevron-down.tsx";
import { pointerMarker } from "../toggle/toggle.ts";

import styles from "./accordion.module.css";

export interface ChangeEventDetails {
  /** `"trigger-press"`: a Trigger click, Enter or Space. `"none"`: the browser opened an Item (find-in-page, fragment navigation). */
  readonly reason: "trigger-press" | "none";
  readonly event: Event;
  /** Keeps the open Items as they were. Only a `"trigger-press"` can be cancelled: the browser has already revealed its match. */
  readonly cancel: () => void;
}

interface AccordionState {
  readonly name: string | undefined;
  readonly value: readonly string[];
  readonly change: (item: string, open: boolean, event: SyntheticEvent<HTMLElement>) => void;
}

const AccordionContext = createContext<AccordionState | null>(null);
const ItemContext = createContext<string | null>(null);

const classes = (own: string | undefined, className: string | undefined) =>
  className === undefined ? own : `${own} ${className}`;

export interface RootProps extends Omit<ComponentProps<"div">, "defaultValue"> {
  /** `false`: opening an Item closes the open one. */
  multiple?: boolean;
  /** The `value`s of the open Items. */
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[], details: ChangeEventDetails) => void;
}

export function Root({
  multiple = false,
  value,
  defaultValue = [],
  onValueChange,
  className,
  ...props
}: RootProps) {
  const name = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value ?? uncontrolled;

  function change(item: string, open: boolean, event: SyntheticEvent<HTMLElement>) {
    const next = open
      ? multiple
        ? [...current, item]
        : [item]
      : current.filter((v) => v !== item);
    const reason = event.type === "click" ? "trigger-press" : "none";
    let cancelled = false;
    onValueChange?.(next, {
      reason,
      event: event.nativeEvent,
      cancel: () => {
        cancelled = true;
      },
    });
    if (cancelled && reason === "trigger-press") return;
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
      <div {...props} className={classes(styles["root"], className)} />
    </AccordionContext>
  );
}

function useAccordion(part: string) {
  const accordion = use(AccordionContext);
  if (accordion === null) throw new Error(`Accordion.${part} must be inside Accordion.Root`);
  return accordion;
}

export interface ItemProps extends Omit<ComponentProps<"details">, "open" | "name"> {
  value: string;
}

export function Item({ value, className, onToggle, ...props }: ItemProps) {
  const accordion = useAccordion("Item");
  const open = accordion.value.includes(value);
  return (
    <ItemContext value={value}>
      <details
        {...props}
        open={open}
        name={accordion.name}
        className={classes(styles["item"], className)}
        onToggle={(event) => {
          onToggle?.(event);
          if (event.currentTarget.open !== open) accordion.change(value, !open, event);
        }}
      />
    </ItemContext>
  );
}

export type TriggerProps = ComponentProps<"summary">;

export function Trigger({
  className,
  children,
  onClick,
  onPointerDown,
  onKeyDown,
  ...props
}: TriggerProps) {
  const accordion = useAccordion("Trigger");
  const item = use(ItemContext);
  if (item === null) throw new Error("Accordion.Trigger must be inside Accordion.Item");
  return (
    <summary
      {...props}
      className={classes(styles["trigger"], className)}
      onPointerDown={(event) => {
        pointerMarker.onPointerDown(event);
        onPointerDown?.(event);
      }}
      onKeyDown={(event) => {
        pointerMarker.onKeyDown(event);
        onKeyDown?.(event);
      }}
      onClick={(event: MouseEvent<HTMLElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        accordion.change(item, !accordion.value.includes(item), event);
      }}
    >
      {children}
      <ChevronDownIcon size="sm" className={styles["icon"]} />
    </summary>
  );
}

export type ContentProps = ComponentProps<"div">;

export function Content({ className, ...props }: ContentProps) {
  return <div {...props} className={classes(styles["content"], className)} />;
}
