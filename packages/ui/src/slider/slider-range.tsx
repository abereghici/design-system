"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/slider.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { useSlider } from "./slider-root.tsx";
import styles from "./slider.module.css";

export type RangeProps = ComponentProps<"div">;

/** The filled part of the Track, up to the value or between the Thumbs. */
export function Range({ style, ...props }: RangeProps) {
  const { values, percent } = useSlider();
  const first = values.length > 1 ? percent(values[0] ?? 0) : 0;
  const last = percent(values.at(-1) ?? 0);

  return (
    <div
      {...mergeProps({ className: styles["range"] }, props)}
      style={{ insetInlineStart: `${first}%`, inlineSize: `${last - first}%`, ...style }}
    />
  );
}
