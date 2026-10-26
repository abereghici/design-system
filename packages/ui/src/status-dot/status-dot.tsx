import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./status-dot.module.css";

export interface StatusDotProps extends ComponentProps<"span"> {
  /** Always place a text label beside the dot: colour is never the only signal. */
  variant?: "neutral" | "success" | "warning" | "danger";
}

/**
 * A small state marker for dense lists and tables, always beside a text label ("● Operational"):
 * the label carries the state, and screen readers skip the dot. For a labelled status pill, use a
 * Tag; for a count, a Badge.
 */
export function StatusDot({ variant = "neutral", className, ...props }: StatusDotProps) {
  return (
    <span
      aria-hidden
      {...props}
      data-variant={variant}
      className={join(styles["root"], className)}
    />
  );
}
