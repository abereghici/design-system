"use client";

import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { useFieldControl } from "../field/field-control.ts";
import { pointerMarker, toggleClick } from "../toggle/toggle.ts";
import type { ChangeEventDetails } from "../toggle/toggle.ts";

import styles from "./checkbox.module.css";

export type CheckboxChangeEventDetails = ChangeEventDetails;

type Name =
  | { children: ReactNode }
  | { children?: undefined; "aria-label": string }
  | { children?: undefined; "aria-labelledby": string };

export type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> &
  Name & {
    /** Called in the click, before the change commits; `details.cancel()` keeps the old state. */
    onCheckedChange?: (checked: boolean, details: CheckboxChangeEventDetails) => void;
    /** Mixed state, shown and announced only: the form still submits by `checked`. */
    indeterminate?: boolean;
    /**
     * Renders `aria-disabled="true"`: the box stays focusable and announced, and the change is
     * blocked. A disabled `<fieldset>` still disables it natively.
     */
    disabled?: boolean;
  };

/**
 * A native checkbox inside its label, for an on/off choice in a form that is submitted, or one item
 * of a set where any number may be chosen. Every committed change dispatches a bubbling
 * `ab-toggle`. For a setting that applies immediately, use Switch; for one choice among several,
 * RadioGroup.
 */
export function Checkbox({
  children,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
  className,
  style,
  ref,
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

  function setRef(input: HTMLInputElement | null): void | (() => void) {
    if (input !== null) input.indeterminate = indeterminate;
    if (typeof ref === "function") return ref(input);
    if (ref) ref.current = input;
  }

  return (
    <label
      {...pointerMarker}
      htmlFor={bindings.id ?? fallbackId}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
      style={style}
    >
      <input
        {...bindings}
        ref={setRef}
        id={bindings.id ?? fallbackId}
        type="checkbox"
        className={styles["input"]}
        onClick={toggleClick("Checkbox", blocked, onClick, onCheckedChange)}
      />
      {children}
    </label>
  );
}
