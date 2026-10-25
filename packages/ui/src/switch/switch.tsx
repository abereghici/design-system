"use client";

import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { useFieldControl } from "../field/use-field.ts";
import { join } from "../slot/slot.tsx";
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
    /** Called before the switch flips; `details.cancel()` keeps the old state. */
    onCheckedChange?: (checked: boolean, details: SwitchChangeEventDetails) => void;
    /**
     * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
     * nearby why it is unavailable.
     */
    disabled?: boolean;
  };

/**
 * An on/off setting that takes effect at once, such as notifications. Its children are its label,
 * which names the setting, never the state. Every change dispatches a bubbling `ab-toggle`. Inside a
 * form that needs Save, use Checkbox.
 */
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
      {...pointerMarker()}
      htmlFor={bindings.id ?? fallbackId}
      className={join(styles["root"], className)}
      style={style}
    >
      <input
        {...bindings}
        id={bindings.id ?? fallbackId}
        type="checkbox"
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
