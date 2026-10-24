import type { ComponentProps } from "react";

import styles from "./tag.module.css";

export interface TagProps extends ComponentProps<"span"> {
  /** Use one Variant per meaning across the product. */
  variant?: "neutral" | "accent" | "success" | "warning" | "danger";
}

/**
 * A static label for status, type or topic ("Draft", "Live", "Failed"), read in line with its
 * neighbours. It is never a button: to filter, use SegmentedControl or Checkbox. For a count, use a
 * Badge (shadcn and Radix call this component Badge); for a state marker in a dense list, a
 * StatusDot.
 */
export function Tag({ variant = "neutral", className, ...props }: TagProps) {
  return (
    <span
      {...props}
      data-variant={variant}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
