"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import { CheckIcon } from "../icon/icons/check.tsx";
import { join } from "../slot/slot.tsx";

import { useItem } from "./menu.tsx";
import type { ItemBaseProps, ItemChangeEventDetails } from "./menu.tsx";
import styles from "./menu.module.css";

function Indicator({ checked, radio }: { checked: boolean; radio: boolean }) {
  return (
    <span aria-hidden className={styles["indicator"]}>
      {checked && (radio ? <span className={styles["diamond"]} /> : <CheckIcon size="sm" />)}
    </span>
  );
}

export interface CheckboxItemProps extends ItemBaseProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Called before the change commits; `details.cancel()` keeps the current state. */
  onCheckedChange?: (checked: boolean, details: ItemChangeEventDetails) => void;
}

/** A setting that turns on and off; the menu stays open unless `closeOnClick`. */
export function CheckboxItem({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onClick,
  children,
  ...rest
}: CheckboxItemProps) {
  const { menu, props, blocked, close: closeMenu } = useItem(rest, "menuitemcheckbox");
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const current = checked ?? uncontrolled;
  return (
    <button
      {...props}
      role="menuitemcheckbox"
      aria-checked={current}
      onClick={(event) => {
        if (blocked(event)) return;
        onClick?.(event);
        if (!requestChange(onCheckedChange, !current, "item-press", event.nativeEvent)) return;
        setUncontrolled(!current);
        dispatchFeedback(event.currentTarget, "ab-toggle", {
          component: menu.component,
          reason: "user",
        });
        closeMenu(event);
      }}
    >
      <Indicator checked={current} radio={false} />
      {children}
    </button>
  );
}

interface RadioGroupState {
  readonly value: string | null;
  readonly select: (value: string, event: MouseEvent<HTMLButtonElement>) => boolean;
}

const RadioGroupContext = createContext<RadioGroupState | null>(null);
const GroupContext = createContext<string | null>(null);

export interface RadioGroupProps extends Omit<ComponentProps<"fieldset">, "defaultValue"> {
  /** The chosen RadioItem's `value`, when your state holds it. */
  value?: string | null;
  /** The starting value when it holds its own state. */
  defaultValue?: string | null;
  /** Called before the change commits; `details.cancel()` keeps the current choice. */
  onValueChange?: (value: string, details: ItemChangeEventDetails) => void;
}

/** One choice among RadioItems, named by its Label. */
export function RadioGroup({
  value,
  defaultValue = null,
  onValueChange,
  ...props
}: RadioGroupProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;
  function select(next: string, event: MouseEvent<HTMLButtonElement>) {
    if (!requestChange(onValueChange, next, "item-press", event.nativeEvent)) return false;
    setUncontrolled(next);
    return true;
  }
  return (
    <RadioGroupContext value={{ value: current, select }}>
      <Group {...props} />
    </RadioGroupContext>
  );
}

export interface RadioItemProps extends ItemBaseProps {
  value: string;
}

export function RadioItem({ value, onClick, children, ...rest }: RadioItemProps) {
  const { menu, props, blocked, close: closeMenu } = useItem(rest, "menuitemradio");
  const group = use(RadioGroupContext);
  if (group === null) throw new Error("RadioItem must be inside a RadioGroup");
  const checked = group.value === value;
  return (
    <button
      {...props}
      role="menuitemradio"
      aria-checked={checked}
      onClick={(event) => {
        if (blocked(event)) return;
        onClick?.(event);
        if (!checked) {
          if (!group.select(value, event)) return;
          dispatchFeedback(event.currentTarget, "ab-toggle", {
            component: menu.component,
            reason: "user",
          });
        }
        closeMenu(event);
      }}
    >
      <Indicator checked={checked} radio />
      {children}
    </button>
  );
}

/** Groups related items under a Label. */
export function Group({ className, ...props }: ComponentProps<"fieldset">) {
  const labelId = useId();
  return (
    <GroupContext value={labelId}>
      <fieldset aria-labelledby={labelId} {...props} className={join(styles["group"], className)} />
    </GroupContext>
  );
}

/** Names its Group or RadioGroup. Not focusable. */
export function Label({ className, ...props }: ComponentProps<"div">) {
  const labelId = use(GroupContext);
  return <div id={labelId ?? undefined} {...props} className={join(styles["label"], className)} />;
}
