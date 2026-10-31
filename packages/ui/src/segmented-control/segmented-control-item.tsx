"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/segmented-control.css";

import { useFieldControl } from "../field/use-field.ts";
import { composeEventHandlers } from "../internal/compose-event-handlers/compose-event-handlers.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { useSegmentedControl } from "./segmented-control-root.tsx";
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
  const group = useSegmentedControl("SegmentedControl.Item");

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
