"use client";

import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { mergeProps } from "../slot/slot.tsx";
import { useLabels } from "../ui-provider/locale.tsx";
import { alert as alertLabels } from "../ui-provider/locales/en-US/alert.ts";

import iconButton from "../icon-button/icon-button.module.css";
import styles from "./alert.module.css";

export interface CloseProps extends ComponentProps<"button"> {
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: { close?: string };
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
}

export function Close({
  labels,
  disabled = false,
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
      aria-label={useLabels("alert", alertLabels, labels).close}
      {...mergeProps({ className: `${iconButton["root"]} ${styles["close"]}` }, props)}
      type={type}
      aria-disabled={disabled ? true : undefined}
      data-size="sm"
      onClick={handleClick}
    >
      <XIcon size="sm" />
    </button>
  );
}
