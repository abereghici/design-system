"use client";

import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import { useSlider } from "./slider-root.tsx";
import styles from "./slider.module.css";

export type RangeProps = ComponentProps<"div">;

export function Range({ className, style, ...props }: RangeProps) {
  const { values, percent } = useSlider();
  const first = values.length > 1 ? percent(values[0] ?? 0) : 0;
  const last = percent(values.at(-1) ?? 0);
  return (
    <div
      {...props}
      className={join(styles["range"], className)}
      style={{ insetInlineStart: `${first}%`, inlineSize: `${last - first}%`, ...style }}
    />
  );
}
