"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { composeEventHandlers } from "../events/events.ts";
import { useFieldControl } from "../field/use-field.ts";
import { mergeProps } from "../slot/slot.tsx";

import { GroupContext } from "./segmented-control-root.tsx";
import styles from "./segmented-control.module.css";

export interface ItemProps extends Omit<
  ComponentProps<"input">,
  "type" | "name" | "checked" | "value"
> {
  /** The control's value when this segment is chosen. */
  value: string;
}

/** One segment; its children are the visible label. */
export function Item({ value, children, className, style, onClick, ...props }: ItemProps) {
  const group = use(GroupContext);

  if (group === null) throw new Error("SegmentedControl.Item must be inside SegmentedControl.Root");

  const bindings = useFieldControl<HTMLInputElement, ComponentProps<"input">>({
    ...props,
    name: group.name,
  });

  return (
    <label {...mergeProps({ className: styles["item"] }, { className, style })}>
      <input
        {...bindings}
        type="radio"
        value={value}
        checked={value === group.value}
        className={styles["radio"]}
        onChange={bindings.onChange}
        onClick={composeEventHandlers(onClick, (event) => {
          group.select(value, event);
        })}
      />
      {children}
    </label>
  );
}
