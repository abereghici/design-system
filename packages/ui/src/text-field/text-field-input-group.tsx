"use client";

import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/field.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import fieldStyles from "../field/field.module.css";
import styles from "./text-field.module.css";

/** The field's box, around an input and the content before and after it. */
export function InputGroup({
  start,
  end,
  children,
  onPointerDown,
  ...props
}: ComponentProps<"div"> & { start: ReactNode; end: ReactNode }) {
  return (
    <div
      {...mergeProps({ className: `${fieldStyles["control"]} ${styles["group"]}` }, props)}
      onPointerDown={(event) => {
        onPointerDown?.(event);

        const input = event.currentTarget.querySelector("input");

        if (!(event.target instanceof Element) || input === null || event.target === input) return;

        if (event.target.closest("button, a, [tabindex]") !== null) return;

        event.preventDefault();
        input.focus();
      }}
    >
      {start !== undefined && <span className={styles["start"]}>{start}</span>}
      {children}
      {end !== undefined && <span className={styles["end"]}>{end}</span>}
    </div>
  );
}
