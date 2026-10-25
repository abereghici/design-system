import type { ComponentProps } from "react";

import type { Locale } from "../ui-provider/locale.tsx";
import { join } from "../slot/slot.tsx";

import styles from "./badge.module.css";

export interface BadgeLabels {
  /** The text for a count above `max`, given the formatted `max` ("99+"). */
  overflow?: (max: string) => string;
}

export interface BadgeProps extends Omit<ComponentProps<"span">, "children"> {
  /**
   * `danger` for counts that need attention, such as errors; `accent` to stand out from neutral
   * counts.
   */
  variant?: "neutral" | "accent" | "danger";
  /** The highest count shown in full; above it the Badge shows "99+", keeping it short. */
  max?: number;
  /**
   * A shipped locale (`@platform/ui/locales/*`). This renders on the server, where the
   * UIProvider's `locale` can't reach, so pass it for any language other than en-US.
   */
  locale?: Locale;
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: BadgeLabels;
  /** A number is formatted and capped; a string (one to four characters) renders as given. */
  children: number | string;
}

const overflowLabel = (max: string) => `${max}+`;

/**
 * A count or a one-glyph mark ("!") next to the tab, nav item or button it counts. Put the exact
 * count in that control's name too ("Inbox, 1 280 unread"), since the Badge alone is easy to miss.
 * For a static word ("Draft"), use a Tag; for a state marker in a dense list, a StatusDot.
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
