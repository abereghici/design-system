"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { composeEventHandlers, dispatchFeedback, requestChange } from "../events/events.ts";
import { useFieldControl } from "../field/field-control.ts";
import { join } from "../slot/slot.tsx";
import { followVisualDirection, pointerMarker, preventDefault } from "../toggle/toggle.ts";
import type { ChangeEventDetails } from "../toggle/toggle.ts";

import styles from "./radio-group.module.css";

export type { ChangeEventDetails } from "../toggle/toggle.ts";

interface Group {
  readonly name: string;
  readonly value: string | null;
  readonly required: boolean | undefined;
  readonly disabled: boolean;
  readonly select: (value: string, event: MouseEvent<HTMLInputElement>) => void;
}

const GroupContext = createContext<Group | null>(null);

export interface RootProps extends Omit<ComponentProps<"fieldset">, "defaultValue" | "disabled"> {
  /** The chosen option, when your state holds it; `null` when nothing is chosen. */
  value?: string | null;
  /** The starting value when it holds its own state. */
  defaultValue?: string | null;
  /** Called before the choice changes; `details.cancel()` keeps the old one. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /** The form field name the choice submits under. */
  name?: string;
  /** Makes a choice necessary before the form submits. */
  required?: boolean;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
  /** `horizontal` for two or three short options that fit on one line. */
  orientation?: "vertical" | "horizontal";
}

/**
 * One choice among 2–6 options that should all stay visible, under a Label. Arrow keys move and
 * choose (following the reading direction), and every change dispatches a bubbling `ab-toggle`. With
 * more options use Select; for a yes/no choice, Switch or Checkbox.
 */
export function Root({
  value,
  defaultValue = null,
  onValueChange,
  name,
  required,
  disabled = false,
  orientation = "vertical",
  className,
  onPointerDown,
  onKeyDown,
  ...props
}: RootProps) {
  const fallbackName = useId();
  const marker = pointerMarker({ onPointerDown, onKeyDown });
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;

  function select(next: string, event: MouseEvent<HTMLInputElement>) {
    if (next === current) return;
    if (!requestChange(onValueChange, next, "none", event.nativeEvent)) {
      event.preventDefault();
      return;
    }
    setUncontrolled(next);
    dispatchFeedback(event.currentTarget, "ab-toggle", { component: "RadioGroup", reason: "user" });
  }

  return (
    <GroupContext
      value={{ name: name ?? fallbackName, value: current, required, disabled, select }}
    >
      <fieldset
        {...props}
        role="radiogroup"
        aria-orientation={orientation}
        data-orientation={orientation}
        className={join(styles["root"], className)}
        {...marker}
        onKeyDown={(event) => {
          marker.onKeyDown(event);
          followVisualDirection(event);
        }}
      />
    </GroupContext>
  );
}

export type LabelProps = ComponentProps<"legend">;

export function Label({ className, ...props }: LabelProps) {
  return <legend {...props} className={join(styles["label"], className)} />;
}

export interface ItemProps extends Omit<
  ComponentProps<"input">,
  "type" | "name" | "checked" | "value"
> {
  value: string;
  /** Keeps this option visible and reachable, but it can't be chosen. */
  disabled?: boolean;
}

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
      className={join(styles["item"], className)}
      style={style}
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
