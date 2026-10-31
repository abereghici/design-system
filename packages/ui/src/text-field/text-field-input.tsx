"use client";

import "@abereghici/tokens/components/field.css";

import * as Field from "../field/field.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./text-field.module.css";

export function Input({ readOnly, ...props }: Field.ControlProps) {
  const bindings = Field.useFieldControl<HTMLInputElement, typeof props>(props);

  return (
    <input
      dir="auto"
      {...mergeProps({ className: styles["input"] }, bindings)}
      readOnly={bindings["aria-disabled"] ?? readOnly}
    />
  );
}
