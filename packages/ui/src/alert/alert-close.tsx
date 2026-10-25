"use client";

import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { join } from "../slot/slot.tsx";

import iconButton from "../icon-button/icon-button.module.css";
import styles from "./alert.module.css";

export interface CloseProps extends Omit<ComponentProps<"button">, "aria-label" | "children"> {
  /** The button's name, such as "Dismiss": it shows only an icon. */
  "aria-label": string;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
}

export function Close({
  disabled = false,
  className,
  type = "button",
  onClick,
  ...props
}: CloseProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    dispatchFeedback(event.currentTarget, "ab-dismiss", { component: "Alert", reason: "user" });
  }

  return (
    <button
      {...props}
      type={type}
      aria-disabled={disabled ? true : undefined}
      data-size="sm"
      className={join(`${iconButton["root"]} ${styles["close"]}`, className)}
      onClick={handleClick}
    >
      <XIcon size="sm" />
    </button>
  );
}
