import type { ComponentProps } from "react";

import styles from "./badge.module.css";

export interface BadgeLabels {
  /** The capped count. `max` arrives already formatted. */
  overflow?: (max: string) => string;
}

export interface BadgeProps extends Omit<ComponentProps<"span">, "children"> {
  variant?: "neutral" | "accent" | "danger";
  /** A numeric count above it renders as `max` plus the overflow label ("99+"). */
  max?: number;
  /**
   * The BCP 47 tag that formats a numeric count. Badge is a Server Component, so it can't read the
   * Provider's locale: pass the app's tag, or the count formats in English.
   */
  locale?: string;
  labels?: BadgeLabels;
  /** A number is formatted and capped; a string (one to four characters) renders as given. */
  children: number | string;
}

const overflowLabel = (max: string) => `${max}+`;

export function Badge({
  variant = "neutral",
  max = 99,
  locale = "en",
  labels,
  className,
  children,
  ...props
}: BadgeProps) {
  const overflow = typeof children === "number" && children > max;
  const formatter = new Intl.NumberFormat(locale);
  return (
    <span
      {...props}
      data-variant={variant}
      data-overflow={overflow || undefined}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    >
      {typeof children === "string"
        ? children
        : overflow
          ? (labels?.overflow ?? overflowLabel)(formatter.format(max))
          : formatter.format(children)}
    </span>
  );
}
