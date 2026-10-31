import type { ComponentProps } from "react";

import "@abereghici/tokens/components/badge.css";

import { FormattedNumber } from "../internal/locale/formatted-number.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./badge.module.css";

export interface BadgeProps extends Omit<ComponentProps<"span">, "children"> {
  /**
   * `danger` for counts that need attention, such as errors; `accent` to stand out from neutral
   * counts.
   */
  variant?: "neutral" | "accent" | "danger";
  /** The highest count shown in full; above it the Badge shows "99+", keeping it short. */
  max?: number;
  /** A number is formatted and capped; a string (one to four characters) renders as given. */
  children: number | string;
}

/**
 * A count or a one-glyph mark ("!") next to the tab, nav item or button it counts. Put the exact
 * count in that control's name too ("Inbox, 1 280 unread"), since the Badge alone is easy to miss.
 * For a static word ("Draft"), use a Tag; for a state marker in a dense list, a StatusDot.
 *
 * Tier 1: works before hydration.
 */
export function Badge({ variant = "neutral", max = 99, children, ...props }: BadgeProps) {
  const overflow = typeof children === "number" && children > max;

  return (
    <span
      {...mergeProps({ className: styles["root"] }, props)}
      data-variant={variant}
      data-overflow={overflow ? "" : undefined}
    >
      {typeof children === "string" ? (
        children
      ) : (
        <>
          <FormattedNumber value={overflow ? max : children} />
          {overflow && "+"}
        </>
      )}
    </span>
  );
}
