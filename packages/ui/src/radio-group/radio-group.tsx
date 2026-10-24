"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { useFieldControl } from "../field/field-control.ts";
import { join } from "../slot/slot.tsx";
import { changeDetails, followVisualDirection, pointerMarker } from "../toggle/toggle.ts";
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
  /** The chosen option; `null` when nothing is chosen. */
  value?: string | null;
  defaultValue?: string | null;
  /** Called in the click, before the change commits; `details.cancel()` keeps the old choice. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /** Shared by every radio, so they form one native group. Generated when omitted. */
  name?: string;
  required?: boolean;
  /** Every radio gets `aria-disabled="true"`: focusable and announced, but cannot be chosen. */
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
}

/**
 * A native fieldset of same-name radios for one choice among 2–6 options that should all stay
 * visible; its Label is the legend. Arrow keys move and choose (following the visual direction in
 * RTL), and every committed change dispatches a bubbling `ab-toggle`. With more options use Select;
 * for a binary choice, Switch or Checkbox.
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
  onKeyDown,
  ...props
}: RootProps) {
  const fallbackName = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;

  function select(next: string, event: MouseEvent<HTMLInputElement>) {
    if (next === current) return;
    onValueChange?.(next, changeDetails(event));
    if (event.defaultPrevented) return;
    setUncontrolled(next);
    dispatchFeedback(event.currentTarget, "ab-toggle", { component: "RadioGroup", reason: "user" });
  }

  return (
    <GroupContext
      value={{ name: name ?? fallbackName, value: current, required, disabled, select }}
    >
      <fieldset
        {...props}
        onPointerDown={pointerMarker.onPointerDown}
        role="radiogroup"
        aria-orientation={orientation}
        data-orientation={orientation}
        className={join(styles["root"], className)}
        onKeyDown={(event) => {
          pointerMarker.onKeyDown(event);
          onKeyDown?.(event);
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
  /** This option only: `aria-disabled="true"`, focusable but cannot be chosen. */
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
  function handleClick(event: MouseEvent<HTMLInputElement>) {
    if (blocked) event.preventDefault();
    else {
      onClick?.(event);
      group?.select(value, event);
    }
  }
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
