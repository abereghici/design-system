import type { ComponentProps } from "react";

import styles from "./status-dot.module.css";

export interface StatusDotProps extends ComponentProps<"span"> {
  /** Always place a text label beside the dot: colour is never the only signal. */
  variant?: "neutral" | "success" | "warning" | "danger";
}

/**
 * A 6 px state marker for dense lists and tables, always beside a text label ("● Operational"): the
 * label carries the state, and the dot is hidden from assistive technology. Neutral is a hollow
 * ring, so "unknown" differs by shape too. For a labelled status pill, use a Tag; for a count, a
 * Badge.
 */
export function StatusDot({ variant = "neutral", className, ...props }: StatusDotProps) {
  return (
    <span
      aria-hidden
      {...props}
      data-variant={variant}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
