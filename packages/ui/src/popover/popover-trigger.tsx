"use client";

import type { ComponentProps } from "react";

import { Slot } from "../internal/slot/slot.tsx";

import { usePopover } from "./popover-root.tsx";

export interface TriggerProps extends ComponentProps<"button"> {
  /** Makes its one child (a Button or IconButton) the Trigger. */
  asChild?: boolean;
}

/** Opens and closes the Content. */
export function Trigger({ asChild = false, ...props }: TriggerProps) {
  const popover = usePopover("Popover.Trigger");
  const Element = asChild ? Slot : "button";

  return (
    <Element
      type={asChild ? undefined : "button"}
      {...popover.triggerProps(props)}
      aria-haspopup="dialog"
    />
  );
}
