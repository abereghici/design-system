"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/alert.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import { IconButton } from "../icon-button/icon-button.tsx";
import { XIcon } from "../icon/icons/x.tsx";
import { chain } from "../internal/chain/chain.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

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
export function Close({ onClick, ...props }: CloseProps) {
  return (
    <IconButton
      {...mergeProps({ className: styles["close"] }, props)}
      size="sm"
      onClick={chain(onClick, (event) => {
        dispatchFeedback(event.currentTarget, "ab-dismiss", {
          component: "Alert",
          userInitiated: true,
        });
      })}
    >
      <XIcon size="sm" />
    </IconButton>
  );
}
