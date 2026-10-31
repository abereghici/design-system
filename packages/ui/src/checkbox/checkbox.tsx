"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/checkbox.css";

import { useFieldControl } from "../field/use-field.ts";
import type { Labelled } from "../internal/accessible-name/accessible-name.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { pointerMarker } from "../internal/interaction/pointer-marker.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { toggleClick } from "../internal/toggle-click/toggle-click.ts";

import styles from "./checkbox.module.css";

/** `cancel()`: keeps the previous state: the browser restores it once the click is cancelled. */
export type CheckboxChangeEventDetails = Details<"none">;

export type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> &
  Labelled<"children"> & {
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
 *
 * Tier 1: works before hydration.
 */
export function Checkbox({
  children,
  onCheckedChange,
  indeterminate = false,
  className,
  style,
  onClick,
  ...props
}: CheckboxProps) {
  const fallbackId = useId();
  const bindings = useFieldControl<HTMLInputElement, ComponentProps<"input">>(props);
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
