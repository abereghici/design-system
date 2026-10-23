"use client";

import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import styles from "./button.module.css";

export interface ButtonProps extends ComponentProps<"button"> {
  /** The visual treatment. */
  variant?: "primary";
  /**
   * Renders `aria-disabled="true"`: the button stays focusable and announced, and activation is
   * blocked. The native `disabled` attribute is never set; a disabled `<fieldset>` still disables
   * the button natively.
   */
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  disabled = false,
  className,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (disabled) {
      // Stops the default action too (form submission or reset).
      event.preventDefault();
      return;
    }
    onClick?.(event);
    dispatchFeedback(event.currentTarget, "ab-press", { component: "Button", reason: "user" });
  }

  return (
    <button
      {...props}
      type={type}
      aria-disabled={disabled ? true : undefined}
      data-variant={variant}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
      onClick={handleClick}
    />
  );
}
