"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { useFieldControl } from "../field/field-control.ts";
import { join } from "../slot/slot.tsx";
import { changeDetails, followVisualDirection, pointerMarker } from "../toggle/toggle.ts";
import type { ChangeEventDetails } from "../toggle/toggle.ts";

import styles from "./segmented-control.module.css";

export type { ChangeEventDetails } from "../toggle/toggle.ts";

interface Group {
  readonly name: string;
  readonly value: string;
  readonly select: (value: string, event: MouseEvent<HTMLInputElement>) => void;
}

const GroupContext = createContext<Group | null>(null);

export type RootProps = Omit<ComponentProps<"fieldset">, "defaultValue"> & {
  /** Called in the click, before the change commits; `details.cancel()` keeps the old choice. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
} & ({ value: string; defaultValue?: never } | { defaultValue: string; value?: never }) &
  ({ "aria-label": string } | { "aria-labelledby": string });

/**
 * A native radio group that switches between 2–5 views or modes of the same content in place; one
 * floating indicator glides to the checked item. Arrow keys move and choose (following the visual
 * direction in RTL), and every committed change dispatches a bubbling `ab-toggle`. For peer
 * sections with their own content use Tabs; for a choice in a form, RadioGroup.
 */
export function Root({
  value,
  defaultValue,
  onValueChange,
  className,
  onPointerDown,
  onKeyDown,
  ...props
}: RootProps) {
  const name = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const current = value ?? uncontrolled;

  function select(next: string, event: MouseEvent<HTMLInputElement>) {
    if (next === current) return;
    onValueChange?.(next, changeDetails(event));
    if (event.defaultPrevented) return;
    setUncontrolled(next);
    dispatchFeedback(event.currentTarget, "ab-toggle", {
      component: "SegmentedControl",
      reason: "user",
    });
  }

  return (
    <GroupContext value={{ name, value: current, select }}>
      <fieldset
        {...props}
        role="radiogroup"
        className={join(styles["root"], className)}
        onPointerDown={(event) => {
          pointerMarker.onPointerDown(event);
          onPointerDown?.(event);
        }}
        onKeyDown={(event) => {
          pointerMarker.onKeyDown(event);
          onKeyDown?.(event);
          followVisualDirection(event);
        }}
      />
    </GroupContext>
  );
}

export interface ItemProps extends Omit<
  ComponentProps<"input">,
  "type" | "name" | "checked" | "value"
> {
  value: string;
}

export function Item({ value, children, className, style, onClick, ...props }: ItemProps) {
  const group = use(GroupContext);
  if (group === null) throw new Error("SegmentedControl.Item must be inside SegmentedControl.Root");
  const bindings = useFieldControl<HTMLInputElement, ComponentProps<"input">>({
    ...props,
    name: group.name,
  });
  return (
    <label className={join(styles["item"], className)} style={style}>
      <input
        {...bindings}
        type="radio"
        value={value}
        checked={value === group.value}
        className={styles["radio"]}
        onChange={bindings.onChange}
        onClick={(event) => {
          onClick?.(event);
          group.select(value, event);
        }}
      />
      {children}
    </label>
  );
}
