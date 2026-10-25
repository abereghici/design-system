"use client";

import type { ComponentProps } from "react";

import { Slot } from "../slot/slot.tsx";

import { useModal } from "./dialog-modal.tsx";

export interface TriggerProps extends Omit<ComponentProps<"button">, "command" | "commandfor"> {
  /** Makes its one child (a Button or IconButton) the Trigger. */
  asChild?: boolean;
}

export function Trigger({ asChild = false, type = "button", ...props }: TriggerProps) {
  const { id } = useModal();
  const Root = asChild ? Slot : "button";
  return <Root {...props} type={asChild ? undefined : type} commandfor={id} command="show-modal" />;
}
