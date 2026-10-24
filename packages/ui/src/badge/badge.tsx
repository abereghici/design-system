import type { ComponentProps } from "react";

import type { Locale } from "../provider/locale.tsx";

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
   * A shipped locale (`@platform/ui/locales/*`) whose tag formats a numeric count, on the server. A
   * Server Component can't read the Provider's `locale`, so without it the count is English.
   */
  locale?: Locale;
  labels?: BadgeLabels;
  /** A number is formatted and capped; a string (one to four characters) renders as given. */
  children: number | string;
}

const overflowLabel = (max: string) => `${max}+`;

export function Badge({
  variant = "neutral",
  max = 99,
  locale,
  labels,
  className,
  children,
  ...props
}: BadgeProps) {
  const overflow = typeof children === "number" && children > max;
  const formatter = new Intl.NumberFormat(locale?.tag ?? "en");
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
