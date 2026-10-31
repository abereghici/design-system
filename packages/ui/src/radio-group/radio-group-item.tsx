"use client";

import { use, useId } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/fieldset.css";
import "@abereghici/tokens/components/radio-group.css";

import { useFieldControl } from "../field/use-field.ts";
import { composeEventHandlers } from "../internal/compose-event-handlers/compose-event-handlers.ts";
import { mergeProps } from "../internal/slot/slot.tsx";
import { preventDefault } from "../internal/toggle/toggle.ts";

import { GroupContext } from "./radio-group-root.tsx";
import styles from "./radio-group.module.css";

export interface ItemProps extends Omit<
  ComponentProps<"input">,
  "type" | "name" | "checked" | "value"
> {
  /** The group's value, and what the form submits, when this option is chosen. */
  value: string;
  /** Keeps this option visible and reachable, but it can't be chosen. */
  disabled?: boolean;
}

/** One option; its children are the visible label. */
export function Item({
  value,
  disabled = false,
  children,
  className,
  style,
  id,
  onClick,
  onChange,
  ...props
}: ItemProps) {
  const group = use(GroupContext);

  if (group === null) throw new Error("RadioGroup.Item must be inside RadioGroup.Root");

  const fallbackId = useId();
  const bindings = useFieldControl<HTMLInputElement, ComponentProps<"input">>({
    ...props,
    id,
    name: group.name,
    disabled: disabled || group.disabled,
    onChange,
  });
  const blocked = bindings["aria-disabled"] === true;
  const handleClick = composeEventHandlers(blocked ? preventDefault : onClick, (event) => {
    group.select(value, event);
  });

  return (
    <label
      htmlFor={bindings.id ?? fallbackId}
      {...mergeProps({ className: styles["item"] }, { className, style })}
    >
      <input
        {...bindings}
        id={bindings.id ?? fallbackId}
        type="radio"
        value={value}
        checked={value === group.value}
        required={group.required}
        className={styles["radio"]}
        onClick={handleClick}
        onChange={bindings.onChange}
      />
      {children}
    </label>
  );
}
