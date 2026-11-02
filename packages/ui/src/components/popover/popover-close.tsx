"use client";

import type { ComponentProps, MouseEvent, ReactElement } from "react";

import { CloseButton } from "../../internal/components/close-button.tsx";
import { useButton } from "../../internal/interactions/use-button.ts";
import { composeEventHandlers } from "../../internal/utils/compose-event-handlers.ts";
import { dispatchFeedback } from "../../internal/utils/dispatch-feedback.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";

import { usePopover } from "./popover-root.tsx";
import styles from "./popover.module.css";

interface CloseBase {
  /** Makes its one child (a Button such as Done) close the Popover. */
  asChild?: boolean;
  /** The name of the `x` button, such as "Close": it shows only an icon. */
  "aria-label"?: string;
  /** With `asChild`, the one child that closes it. */
  children?: ReactElement;
}

type Shape =
  | { asChild: true; children: ReactElement }
  | { asChild?: false; "aria-label": string; children?: never };

export type CloseProps = Omit<ComponentProps<"button">, "aria-label" | "children"> &
  CloseBase &
  Shape;

/** Closes the Popover. Without children it is the `x` button in the corner. */
export function Close({ disabled = false, onClick, ...props }: CloseProps) {
  const asChild = props.asChild === true;
  const popover = usePopover("Popover.Close");
  const invoker = { commandfor: popover.contentId, command: "hide-popover" } as const;
  const press = composeEventHandlers(onClick, (event: MouseEvent<HTMLButtonElement>) => {
    if (!popover.request(false, "close-press", event.nativeEvent)) {
      event.preventDefault();
    } else if (!asChild) {
      dispatchFeedback(event.currentTarget, "ab-dismiss", {
        component: "Popover",
        userInitiated: true,
      });
    }
  });
  const button = useButton<HTMLButtonElement>({ disabled, onClick: press });

  if (asChild) {
    const { asChild: _, ...child } = props;

    return <Slot {...mergeProps(button, child)} {...invoker} />;
  }

  const { asChild: _, ...own } = props;

  return (
    <CloseButton
      {...mergeProps({ className: styles["close"] }, own)}
      {...invoker}
      disabled={disabled}
      onClick={press}
    />
  );
}
