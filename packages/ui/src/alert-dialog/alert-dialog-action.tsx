"use client";

import { mergeProps } from "../slot/slot.tsx";

import type { ButtonProps } from "./alert-dialog-root.tsx";
import { useClose } from "./alert-dialog-root.tsx";
import button from "../button/button.module.css";

export interface ActionProps extends ButtonProps {
  /** `danger` for destructive actions (Delete, Discard, Revoke). */
  variant?: "primary" | "danger";
}

/**
 * The answer that carries out the action. It closes the dialog after `onClick`, unless
 * `onOpenChange` cancels.
 */
export function Action({ variant = "primary", onClick, ...props }: ActionProps) {
  return (
    <button
      {...mergeProps({ className: button["root"] }, props)}
      {...useClose(onClick, false)}
      data-variant={variant}
      data-size="md"
    />
  );
}
