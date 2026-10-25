"use client";

import type { ComponentProps, MouseEvent, ReactElement } from "react";

import { composeEventHandlers, dispatchFeedback } from "../events/events.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { Slot, join } from "../slot/slot.tsx";

import { usePopover } from "./popover-root.tsx";
import iconButtonStyles from "../icon-button/icon-button.module.css";
import styles from "./popover.module.css";

type Shape =
  | {
      /** Makes its one child (a Button such as Done) close the Popover. */
      asChild: true;
      children: ReactElement;
    }
  | {
      asChild?: false;
      /** The name of the `x` button, such as "Close": it shows only an icon. */
      "aria-label": string;
      children?: never;
    };

export type CloseProps = Omit<ComponentProps<"button">, "aria-label" | "children"> & Shape;

/** Closes the Popover. Without children it is the `x` button in the corner. */
export function Close({ asChild = false, className, ...props }: CloseProps) {
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
  if (asChild) return <Slot {...shared} className={className} />;
  return (
    <button
      type="button"
      {...shared}
      data-size="sm"
      className={`${iconButtonStyles["root"]} ${join(styles["close"], className)}`}
    >
      <XIcon size="sm" />
    </button>
  );
}
