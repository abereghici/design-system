"use client";

import type { ComponentProps, MouseEvent, ReactElement } from "react";

import "@abereghici/tokens/components/icon-button.css";
import "@abereghici/tokens/components/popover.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { composeEventHandlers } from "../internal/compose-event-handlers/compose-event-handlers.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { Slot } from "../internal/slot/slot.tsx";
import { useButton } from "../internal/use-button/use-button.ts";

import { usePopover } from "./popover-root.tsx";
import iconButtonStyles from "../icon-button/icon-button.module.css";
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
export function Close({ asChild = false, disabled = false, onClick, ...props }: CloseProps) {
  const popover = usePopover("Popover.Close");
  const invoker = { commandfor: popover.contentId, command: "hide-popover" } as const;
  const button = useButton<HTMLButtonElement>({
    disabled,
    onClick: composeEventHandlers(onClick, (event: MouseEvent<HTMLButtonElement>) => {
      if (!popover.request(false, "close-press", event.nativeEvent)) {
        event.preventDefault();
      } else if (!asChild) {
        dispatchFeedback(event.currentTarget, "ab-dismiss", {
          component: "Popover",
          userInitiated: true,
        });
      }
    }),
  });

  if (asChild) return <Slot {...mergeProps(button, props)} {...invoker} />;

  return (
    <button
      type="button"
      {...mergeProps(
        { className: `${iconButtonStyles["root"]} ${styles["close"]}`, ...button },
        props,
      )}
      {...invoker}
      data-size="sm"
    >
      <XIcon size="sm" />
    </button>
  );
}
