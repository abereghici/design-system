"use client";

import type { ComponentProps, MouseEventHandler } from "react";

import { TouchTarget } from "../../internal/components/touch-target/touch-target.tsx";
import { usePressButton } from "../../internal/interactions/use-press-button.ts";
import type { InvokerCommands } from "../../internal/types/invoker-commands.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot, Slottable } from "../../internal/utils/slot.tsx";
import { Spinner } from "../spinner/spinner.tsx";

import styles from "./button.module.css";

export interface ButtonProps extends Omit<ComponentProps<"button">, "onClick">, InvokerCommands {
  /** Runs on every press, unless the Button is disabled or loading. */
  onClick?: MouseEventHandler<HTMLElement> | undefined;
  /**
   * The weight of the action: one `primary` per view, `secondary` for the rest, `tertiary` in
   * toolbars and dense rows, `danger` only to confirm a destructive action.
   */
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  /**
   * `lg` for prominent or spacious layouts, `sm` for dense ones.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Shows a spinner and blocks presses while the action runs, keeping the label, width and focus.
   */
  loading?: boolean;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean | undefined;
  /** `submit` sends its form; the default, `button`, does nothing on its own. */
  type?: "button" | "submit" | "reset" | undefined;
  /**
   * Gives the Button's look to its one child, such as a router link that should look like a button.
   */
  asChild?: boolean;
}

/**
 * Starts an action, such as saving or opening a dialog. It never submits a form unless you pass
 * `type="submit"`, and every press dispatches a bubbling `ab-press` event after `onClick`. For an
 * icon-only action, use IconButton; to go to another page, use Link.
 *
 * Tier 1: works before hydration.
 */
export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  asChild = false,
  type = "button",
  onClick,
  children,
  ...props
}: ButtonProps) {
  const blocked = disabled || loading;
  const spinner = loading ? <Spinner aria-hidden className={styles["spinner"]} /> : null;
  const button = usePressButton<HTMLElement>("Button", { disabled: blocked, onClick });
  const Root = asChild ? Slot : "button";

  return (
    <Root
      {...mergeProps({ className: styles["root"], ...button }, props)}
      type={asChild ? undefined : type}
      aria-busy={loading ? true : undefined}
      data-loading={loading ? "" : undefined}
      data-variant={variant}
      data-size={size}
    >
      <Slottable>{children}</Slottable>
      {spinner}
      <TouchTarget />
    </Root>
  );
}
