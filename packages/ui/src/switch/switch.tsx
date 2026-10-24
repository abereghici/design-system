"use client";

import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { useFieldControl } from "../field/field-control.ts";
import { pointerMarker, toggleClick } from "../toggle/toggle.ts";
import type { ChangeEventDetails } from "../toggle/toggle.ts";

import styles from "./switch.module.css";

export type SwitchChangeEventDetails = ChangeEventDetails;

type Name =
  | { children: ReactNode }
  | { children?: undefined; "aria-label": string }
  | { children?: undefined; "aria-labelledby": string };

export type SwitchProps = Omit<ComponentProps<"input">, "type" | "role" | "children"> &
  Name & {
    /** Called in the click, before the change commits; `details.cancel()` keeps the old state. */
    onCheckedChange?: (checked: boolean, details: SwitchChangeEventDetails) => void;
    /**
     * Renders `aria-disabled="true"`: the switch stays focusable and announced, and the change is
     * blocked. A disabled `<fieldset>` still disables it natively.
     */
    disabled?: boolean;
  };

export function Switch({
  children,
  onCheckedChange,
  disabled = false,
  className,
  style,
  id,
  onClick,
  onChange,
  ...props
}: SwitchProps) {
  const fallbackId = useId();
  const bindings = useFieldControl<HTMLInputElement, ComponentProps<"input">>({
    ...props,
    id,
    disabled,
    onChange: (event) => onChange?.(event),
  });

  return (
    <label
      {...pointerMarker}
      htmlFor={bindings.id ?? fallbackId}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
      style={style}
    >
      <input
        {...bindings}
        id={bindings.id ?? fallbackId}
        type="checkbox"
        // oxlint-disable-next-line jsx-a11y/role-has-required-aria-props -- oxlint bug: lacks jsx-a11y's isSemanticRoleElement exemption for input[type=checkbox][role=switch]; ARIA in HTML forbids aria-checked here
        role="switch"
        className={styles["track"]}
        onClick={toggleClick(
          "Switch",
          bindings["aria-disabled"] === true,
          onClick,
          onCheckedChange,
        )}
      />
      {children}
    </label>
  );
}
