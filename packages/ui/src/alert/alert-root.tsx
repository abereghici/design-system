import type { ComponentProps } from "react";

import "@abereghici/tokens/components/alert.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { variantIcons } from "../internal/variant-icons/variant-icons.ts";

import styles from "./alert.module.css";

export interface RootProps extends ComponentProps<"div"> {
  /** The kind of situation, shown by color and icon; the Title still says it in words. */
  variant?: "neutral" | "success" | "warning" | "danger";
  /**
   * Pass `"alert"` only for an urgent message inserted after the page loads, so screen readers
   * announce it at once; `"status"` only on an Alert already shown whose text then changes. A
   * message present from the start is read in order and needs none.
   */
  role?: ComponentProps<"div">["role"];
}

/**
 * An inline message about the page or a task that stays relevant until the situation changes.
 * `Alert.Close` calls your `onClick`, where the app removes the Alert and moves focus to what the
 * message was about. For a brief confirmation use a Toast; for a decision that must interrupt, an
 * AlertDialog.
 *
 * Tier 1: works before hydration.
 */
export function Root({ variant = "neutral", children, ...props }: RootProps) {
  const Icon = variantIcons[variant];

  return (
    <div {...mergeProps({ className: styles["root"] }, props)} data-variant={variant}>
      <Icon size="sm" className={styles["icon"]} />
      {children}
    </div>
  );
}
