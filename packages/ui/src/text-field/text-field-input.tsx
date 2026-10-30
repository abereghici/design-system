"use client";

import "@abereghici/tokens/components/field.css";

import * as Field from "../field/field.tsx";

import styles from "./text-field.module.css";

export function Input({ readOnly, ...props }: Field.ControlProps) {
  const bindings = Field.useFieldControl<HTMLInputElement, typeof props>(props);

  return (
    <input
      dir="auto"
      {...bindings}
      readOnly={bindings["aria-disabled"] ?? readOnly}
      className={styles["input"]}
    />
  );
}
