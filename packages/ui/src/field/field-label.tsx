"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import { FieldContext } from "./use-field.ts";
import styles from "./field.module.css";

export function Label({ className, ...props }: ComponentProps<"label">) {
  const field = use(FieldContext);
  return (
    <label
      id={field?.labelId}
      htmlFor={field?.controlId}
      {...props}
      className={join(styles["label"], className)}
    />
  );
}
