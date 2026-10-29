"use client";

import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import { useSlider } from "./slider-root.tsx";
import styles from "./slider.module.css";

export type ValueProps = ComponentProps<"output">;

/** The current value as formatted text, announced as it changes. */
export function Value({ style, children, ...props }: ValueProps) {
  const { id, values, format, min, max } = useSlider();
  const widest = Math.max(format(min).length, format(max).length);

  return (
    <output
      htmlFor={values.map((_, index) => `${id}-${index}`).join(" ")}
      aria-live="off"
      {...mergeProps({ className: styles["value"] }, props)}
      style={{ minInlineSize: `${values.length * (widest + 1) - 1}ch`, ...style }}
    >
      {children ?? values.map((entry) => format(entry)).join("–")}
    </output>
  );
}
