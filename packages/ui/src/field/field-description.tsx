"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/field.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { FieldContext } from "./use-field.ts";
import styles from "./field.module.css";

/** Helper text under the control, read after its name. */
export function Description(props: ComponentProps<"p">) {
  const field = use(FieldContext);

  return (
    <p
      id={field?.descriptionId}
      hidden={field?.invalid}
      {...mergeProps({ className: styles["description"] }, props)}
    />
  );
}
