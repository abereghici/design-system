import type { ComponentProps } from "react";

import styles from "./tag.module.css";

export interface TagProps extends ComponentProps<"span"> {
  /** Use one Variant per meaning across the product. */
  variant?: "neutral" | "accent" | "success" | "warning" | "danger";
}

export function Tag({ variant = "neutral", className, ...props }: TagProps) {
  return (
    <span
      {...props}
      data-variant={variant}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
