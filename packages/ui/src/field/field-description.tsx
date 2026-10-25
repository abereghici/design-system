"use client";

import { use, useEffect } from "react";
import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import { FieldContext } from "./use-field.ts";
import styles from "./field.module.css";

export function Description(props: ComponentProps<"p">) {
  const field = use(FieldContext);
  const describe = field?.describe;
  useEffect(() => {
    describe?.(true);
    return () => {
      describe?.(false);
    };
  }, [describe]);
  return (
    <p
      id={field?.descriptionId}
      hidden={field?.invalid}
      {...mergeProps({ className: styles["description"] }, props)}
    />
  );
}
