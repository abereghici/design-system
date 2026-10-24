"use client";

import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

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

  function setRef(input: HTMLInputElement | null): void | (() => void) {
    if (input !== null) input.indeterminate = indeterminate;
    if (typeof ref === "function") return ref(input);
    if (ref) ref.current = input;
  }

  return (
    <label
      {...pointerMarker}
      htmlFor={id ?? fallbackId}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
      style={style}
    >
      <input
        {...props}
        ref={setRef}
        id={id ?? fallbackId}
        type="checkbox"
        aria-disabled={disabled ? true : undefined}
        className={styles["input"]}
        onClick={toggleClick("Checkbox", disabled, onClick, onCheckedChange)}
        // React warns about a controlled `checked` without onChange; the change runs in onClick.
        onChange={(event) => onChange?.(event)}
      />
      {children}
    </label>
  );
}
