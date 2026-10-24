import type { ComponentProps } from "react";

import type { Locale } from "../provider/locale.tsx";
import { join } from "../slot/slot.tsx";

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
   * A shipped locale (`@platform/ui/locales/*`) that formats a numeric count on the server. A
   * Server Component can't read the Provider's `locale`, so without it the count is en-US.
   */
  locale?: Locale;
  labels?: BadgeLabels;
  /** A number is formatted and capped; a string (one to four characters) renders as given. */
  children: number | string;
}

const overflowLabel = (max: string) => `${max}+`;

/**
 * A count or a one-glyph mark ("!") placed next to the tab, nav item or button it counts. A number
 * is formatted with `Intl.NumberFormat` and capped at `max`. It is a Server Component, so pass
 * `locale` to format in the app's language. Put the exact count in the owner's accessible name
 * ("Inbox, 1 280 unread"). For a static word ("Draft"), use a Tag; for a state marker in a dense
 * list, a StatusDot.
 */
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
  const formatter = new Intl.NumberFormat(locale?.tag ?? "en-US");
  return (
    <span
      {...props}
      data-variant={variant}
      data-overflow={overflow || undefined}
      className={join(styles["root"], className)}
    >
      {typeof children === "string"
        ? children
        : overflow
          ? (labels?.overflow ?? overflowLabel)(formatter.format(max))
          : formatter.format(children)}
    </span>
  );
}
