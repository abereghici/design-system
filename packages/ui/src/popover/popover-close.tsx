"use client";

import type { ComponentProps, MouseEvent } from "react";

import { composeEventHandlers, dispatchFeedback } from "../events/events.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { Slot, mergeProps } from "../slot/slot.tsx";
import { useLabels } from "../ui-provider/locale.tsx";
import { popover as popoverLabels } from "../ui-provider/locales/en-US/popover.ts";

import { usePopover } from "./popover-root.tsx";
import iconButtonStyles from "../icon-button/icon-button.module.css";
import styles from "./popover.module.css";

export interface CloseProps extends ComponentProps<"button"> {
  /** Makes its one child (a Button such as Done) close the Popover. */
  asChild?: boolean;
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: { close?: string };
}

/** Closes the Popover. Without children it is the `x` button in the corner. */
export function Close({ asChild = false, labels, ...props }: CloseProps) {
  const popover = usePopover();
  const { close } = useLabels("popover", popoverLabels, labels);
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
      aria-label={close}
      {...mergeProps({ className: `${iconButtonStyles["root"]} ${styles["close"]}` }, shared)}
      data-size="sm"
    >
      <XIcon size="sm" />
    </button>
  );
}
