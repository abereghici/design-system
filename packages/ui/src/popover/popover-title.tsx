"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/popover.css";

import { Slot, mergeProps } from "../internal/slot/slot.tsx";

import { usePopover } from "./popover-root.tsx";
import styles from "./popover.module.css";

export interface TitleProps extends ComponentProps<"h2"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
  asChild?: boolean;
}

/** Names the Content. */
export function Title({ asChild = false, ...props }: TitleProps) {
  const popover = usePopover();
  const Element = asChild ? Slot : "h2";

  return (
    <Element
      id={`${popover.contentId}-title`}
      {...mergeProps({ className: styles["title"] }, props)}
    />
  );
}
