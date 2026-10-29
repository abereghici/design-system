import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./tag.module.css";

export interface TagProps extends ComponentProps<"span"> {
  /** The meaning, kept the same across the product, such as `success` for every "Live". */
  variant?: "neutral" | "accent" | "success" | "warning" | "danger";
}

/**
 * A static label for status, type or topic ("Draft", "Live", "Failed"). It is never a button: to
 * filter, use SegmentedControl or Checkbox. For a count, use a Badge (other libraries call this
 * component Badge); for a state marker in a dense list, a StatusDot.
 */
export function Tag({ variant = "neutral", ...props }: TagProps) {
  return <span {...mergeProps({ className: styles["root"] }, props)} data-variant={variant} />;
}
