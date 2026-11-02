"use client";

import "@abereghici/tokens/components/alert.css";

import type { ComponentProps } from "react";

import { CloseButton } from "../../internal/components/close-button.tsx";
import type { InvokerCommands } from "../../internal/types/invoker-commands.ts";
import { chain } from "../../internal/utils/chain.ts";
import { dispatchFeedback } from "../../internal/utils/dispatch-feedback.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./alert.module.css";

export interface CloseProps
  extends Omit<ComponentProps<"button">, "aria-label" | "children">, InvokerCommands {
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
    <CloseButton
      {...mergeProps({ className: styles["close"] }, props)}
      onClick={chain(onClick, (event) => {
        dispatchFeedback(event.currentTarget, "ab-dismiss", {
          component: "Alert",
          userInitiated: true,
        });
      })}
    />
  );
}
