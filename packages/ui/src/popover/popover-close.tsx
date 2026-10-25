"use client";

import type { ComponentProps, MouseEvent, ReactElement } from "react";

import { composeEventHandlers, dispatchFeedback } from "../events/events.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { Slot, mergeProps } from "../slot/slot.tsx";

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
export function Close({ asChild = false, ...props }: CloseProps) {
  const popover = usePopover();
  const shared = {
    ...props,
    commandfor: popover.contentId,
    command: "hide-popover" as const,
    onClick: composeEventHandlers(props.onClick, (event: MouseEvent<HTMLButtonElement>) => {
      if (!popover.request(false, "close-press", event.nativeEvent)) {
        event.preventDefault();
      } else if (!asChild) {
        dispatchFeedback(event.currentTarget, "ab-dismiss", {
          component: "Popover",
          reason: "user",
        });
      }
    }),
  };

  if (asChild) return <Slot {...shared} />;

  return (
    <button
      type="button"
      {...mergeProps({ className: `${iconButtonStyles["root"]} ${styles["close"]}` }, shared)}
      data-size="sm"
    >
      <XIcon size="sm" />
    </button>
  );
}
