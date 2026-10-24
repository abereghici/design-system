"use client";

import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { useLocale } from "../provider/locale.tsx";

import { alertLabels } from "./labels.ts";
import iconButton from "../icon-button/icon-button.module.css";
import styles from "./alert.module.css";

export interface CloseProps extends ComponentProps<"button"> {
  /** Overrides the Provider's locale for this button's accessible name. */
  labels?: { close?: string };
  /**
   * Renders `aria-disabled="true"`: the button stays focusable and announced, and activation is
   * blocked.
   */
  disabled?: boolean;
}

export function Close({
  labels,
  disabled = false,
  className,
  type = "button",
  onClick,
  ...props
}: CloseProps) {
  const locale = useLocale();

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
      aria-label={labels?.close ?? locale.labels.alert?.close ?? alertLabels.close}
      {...props}
      type={type}
      aria-disabled={disabled ? true : undefined}
      data-size="sm"
      className={`${iconButton["root"]} ${styles["close"]}${className === undefined ? "" : ` ${className}`}`}
      onClick={handleClick}
    >
      <XIcon size="sm" />
    </button>
  );
}
