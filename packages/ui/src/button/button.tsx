"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import styles from "./button.module.css";

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  /** Heights 28 / 32 / 40, growing to 40 / 44 / 48 on coarse pointers. */
  size?: "sm" | "md" | "lg";
  /** Busy: renders `aria-busy="true"` and blocks activation; the label and focus stay. */
  loading?: boolean;
  /**
   * Renders `aria-disabled="true"`: the button stays focusable and announced, and activation is
   * blocked. The native `disabled` attribute is never set; a disabled `<fieldset>` still disables
   * the button natively.
   */
  disabled?: boolean;
  /** Renders the single child element (a link, a router link) with the Button's props and styles. */
  asChild?: boolean;
}

/** Triggers an action. To navigate, use Link. */
export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  asChild = false,
  className,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (disabled || loading) {
      // preventDefault also stops a submit or reset button from acting on its form.
      event.preventDefault();
      return;
    }
    onClick?.(event);
    dispatchFeedback(event.currentTarget, "ab-press", { component: "Button", reason: "user" });
  }

  const Root = asChild ? Slot : "button";
  return (
    <Root
      {...props}
      type={asChild ? undefined : type}
      aria-disabled={disabled ? true : undefined}
      aria-busy={loading ? true : undefined}
      data-loading={loading ? "" : undefined}
      data-variant={variant}
      data-size={size}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
      onClick={handleClick}
    />
  );
}
