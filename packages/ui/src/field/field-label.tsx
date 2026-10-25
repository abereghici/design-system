"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import { FieldContext } from "./use-field.ts";
import styles from "./field.module.css";

export function Label(props: ComponentProps<"label">) {
  const field = use(FieldContext);
  return (
    <label
      id={field?.labelId}
      htmlFor={field?.controlId}
      {...mergeProps({ className: styles["label"] }, props)}
    />
  );
}
