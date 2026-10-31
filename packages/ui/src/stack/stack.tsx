import type { ComponentProps } from "react";

import { Flex } from "../internal/flex/flex.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./stack.module.css";

export interface StackProps extends ComponentProps<"div"> {
  /** The space between children. */
  gap?: `stack-${"xs" | "sm" | "md" | "lg" | "xl" | "2xl"}`;
  /** Where children sit across the line; `stretch` makes them as wide as the stack. */
  align?: "start" | "center" | "end" | "stretch";
  /** Where children sit from top to bottom when the stack is taller than they are. */
  justify?: "start" | "center" | "end" | "space-between";
  /** Makes its one child the stack, such as a list, so its semantics stay. */
  asChild?: boolean;
}

/**
 * Lays out its children one below the other, spaced by a stack space token, such as the fields of a
 * form, so vertical rhythm comes from the spacing scale instead of margins. Use Inline for a row and
 * Grid for a set of cards.
 *
 * Tier 1: works before hydration.
 */
export function Stack({
  gap = "stack-md",
  align = "stretch",
  justify = "start",
  asChild = false,
  ...props
}: StackProps) {
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
