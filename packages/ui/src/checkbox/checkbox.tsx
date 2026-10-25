"use client";

import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { pointerMarker } from "../events/events.ts";
import { useFieldControl } from "../field/use-field.ts";
import { mergeProps } from "../slot/slot.tsx";
import { toggleClick } from "../toggle/toggle.ts";
import type { ChangeEventDetails } from "../toggle/toggle.ts";

import styles from "./checkbox.module.css";

export type CheckboxChangeEventDetails = ChangeEventDetails;

type Name =
  | { children: ReactNode }
  | { children?: undefined; "aria-label": string }
  | { children?: undefined; "aria-labelledby": string };

export type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> &
  Name & {
    /** Called before the box changes; `details.cancel()` keeps the old state. */
    onCheckedChange?: (checked: boolean, details: CheckboxChangeEventDetails) => void;
    /** Shows "some selected", for a box that selects a group whose items are partly chosen. */
    indeterminate?: boolean;
    /**
     * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
     * nearby why it is unavailable.
     */
    disabled?: boolean;
  };

/**
 * An on/off choice in a form that is submitted, or one item of a set where any number may be
 * chosen. Its children are its label. Every change dispatches a bubbling `ab-toggle`. For a setting
 * that applies at once, use Switch; for one choice among several, RadioGroup.
 */
export function Checkbox({
  children,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
  className,
  style,
  id,
  onClick,
  onChange,
  ...props
}: CheckboxProps) {
  const fallbackId = useId();
  const bindings = useFieldControl<HTMLInputElement, ComponentProps<"input">>({
    ...props,
    id,
    disabled,
    onChange: (event) => onChange?.(event),
  });
  const blocked = bindings["aria-disabled"] === true;

  function setIndeterminate(input: HTMLInputElement | null) {
    if (input !== null) input.indeterminate = indeterminate;
  }

  return (
    <label
      {...pointerMarker}
      htmlFor={bindings.id ?? fallbackId}
      {...mergeProps({ className: styles["root"] }, { className, style })}
    >
      <input
        {...mergeProps({ ref: setIndeterminate }, bindings)}
        id={bindings.id ?? fallbackId}
        type="checkbox"
        className={styles["input"]}
        onClick={toggleClick("Checkbox", blocked, onClick, onCheckedChange)}
      />
      {children}
    </label>
  );
}
