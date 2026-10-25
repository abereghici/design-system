"use client";

import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import { useFieldControl } from "./use-field.ts";
import type { ChangeEventDetails } from "./use-field.ts";
import styles from "./field.module.css";

export interface ControlProps extends ComponentProps<"input"> {
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /**
   * Stops editing but keeps the text focusable and selectable, so it can still be read and copied.
   */
  disabled?: boolean;
}

/** The text input, named and described by its Field. */
export function Control({ className, readOnly, ...props }: ControlProps) {
  const bindings = useFieldControl<HTMLInputElement, typeof props>(props);
  return (
    <input
      {...bindings}
      readOnly={bindings["aria-disabled"] ?? readOnly}
      className={join(styles["control"], className)}
    />
  );
}
