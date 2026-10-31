"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/icon-button.css";
import "@abereghici/tokens/components/alert.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { useButton } from "../internal/use-button/use-button.ts";

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

/** The dismiss button; your `onClick` removes the Alert. */
export function Close({ disabled = false, onClick, ...props }: CloseProps) {
  const button = useButton<HTMLButtonElement>({
    disabled,
    onClick: (event) => {
      onClick?.(event);
      dispatchFeedback(event.currentTarget, "ab-dismiss", {
        component: "Alert",
        userInitiated: true,
      });
    },
  });

  return (
    <button
      type="button"
      {...mergeProps({ className: `${iconButton["root"]} ${styles["close"]}`, ...button }, props)}
      data-size="sm"
    >
      <XIcon size="sm" />
    </button>
  );
}
