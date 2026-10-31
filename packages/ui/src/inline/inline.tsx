import type { ComponentProps } from "react";

import { Flex } from "../internal/flex/flex.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./inline.module.css";

export interface InlineProps extends ComponentProps<"div"> {
  /** The space between children, and between the lines they wrap onto. */
  gap?: `inline-${"xs" | "sm" | "md" | "lg" | "xl"}`;
  /** Where children of different heights sit on their line. */
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  /** Where children sit along the line when they don't fill it. */
  justify?: "start" | "center" | "end" | "space-between";
  /** Makes its one child the row, such as a list, so its semantics stay. */
  asChild?: boolean;
}

/**
 * Lays out its children side by side in reading order, spaced by an inline space token, and wraps
 * them onto the next line when they don't fit, such as a row of actions or tags.
 *
 * Tier 1: works before hydration.
 */
export function Inline({
  gap = "inline-sm",
  align = "center",
  justify = "start",
  asChild = false,
  ...props
}: InlineProps) {
  return (
    <Flex
      {...mergeProps({ className: styles["root"] }, props)}
      gap={gap}
      align={align}
      justify={justify}
      asChild={asChild}
    />
  );
}
