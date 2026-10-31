"use client";

import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/icon-button.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import { Slot, mergeProps } from "../internal/slot/slot.tsx";
import { Spinner } from "../spinner/spinner.tsx";

import styles from "./icon-button.module.css";

export type IconButtonProps = Omit<ComponentProps<"button">, "aria-label" | "aria-labelledby"> &
  AccessibleName & {
    /**
     * `lg` for prominent or spacious layouts, `sm` for dense ones. Touch screens get larger targets
     * on their own.
     */
    size?: "sm" | "md" | "lg";
    /** Shows a spinner and blocks presses while the action runs, keeping focus. */
    loading?: boolean;
    /**
     * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
     * nearby why it is unavailable.
     */
    disabled?: boolean;
    /** `submit` sends its form; the default, `button`, does nothing on its own. */
    type?: "button" | "submit" | "reset";
    /** Gives the IconButton's look to its one child, such as a link. */
    asChild?: boolean;
  };

/**
 * An action shown as an icon alone, for toolbars and tight rows. Give it a name with `aria-label`
 * (or `aria-labelledby`), since the icon says nothing to a screen reader. A press dispatches
 * `ab-press`. For an icon that stays on or off, such as Pin or Bold, use a ToggleButton; use a
 * Button with a visible label whenever space allows.
 *
 * Tier 1: works before hydration.
 */
export function IconButton({
  size = "md",
  loading = false,
  disabled = false,
  asChild = false,
  type = "button",
  onClick,
  ...props
}: IconButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (disabled || loading) {
      event.preventDefault();

      return;
    }

    onClick?.(event);
    dispatchFeedback(event.currentTarget, "ab-press", {
      component: "IconButton",
      userInitiated: true,
    });
  }

  const Root = asChild ? Slot : "button";

  return (
    <Root
      {...mergeProps({ className: styles["root"] }, props)}
      type={asChild ? undefined : type}
      aria-disabled={disabled ? true : undefined}
      aria-busy={loading ? true : undefined}
      data-loading={loading ? "" : undefined}
      data-size={size}
      onClick={handleClick}
    >
      {loading && !asChild ? <Spinner aria-hidden /> : props.children}
    </Root>
  );
}
