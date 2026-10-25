"use client";

import type { ComponentProps } from "react";

import { Slot, join } from "../slot/slot.tsx";

import { usePopover } from "./popover-root.tsx";
import styles from "./popover.module.css";

export interface TitleProps extends ComponentProps<"h2"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
  asChild?: boolean;
}

/** Names the Content. */
export function Title({ asChild = false, className, ...props }: TitleProps) {
  const popover = usePopover();
  const Element = asChild ? Slot : "h2";
  return (
    <Element
      id={`${popover.contentId}-title`}
      {...props}
      className={join(styles["title"], className)}
    />
  );
}
