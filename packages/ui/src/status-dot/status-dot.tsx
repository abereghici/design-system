import type { ComponentProps } from "react";

import styles from "./status-dot.module.css";

export interface StatusDotProps extends ComponentProps<"span"> {
  /** Always place a text label beside the dot: colour is never the only signal. */
  variant?: "neutral" | "success" | "warning" | "danger";
}

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
