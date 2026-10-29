"use client";

import type { ComponentProps } from "react";

import { Slot } from "../internal/slot/slot.tsx";

import { useModal } from "./dialog-modal.tsx";

export interface TriggerProps extends Omit<ComponentProps<"button">, "command" | "commandfor"> {
  /** Makes its one child (a Button or IconButton) the Trigger. */
  asChild?: boolean;
}

/** Opens the dialog; focus returns here when it closes. */
export function Trigger({ asChild = false, ...props }: TriggerProps) {
  const { id } = useModal();
  const Root = asChild ? Slot : "button";

  return (
    <Root type={asChild ? undefined : "button"} {...props} commandfor={id} command="show-modal" />
  );
}
