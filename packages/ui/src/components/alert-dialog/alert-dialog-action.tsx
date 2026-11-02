"use client";

import { PressFeedbackContext } from "../../internal/interactions/use-press-feedback.ts";
import { Button } from "../button/button.tsx";

import type { ButtonProps } from "./alert-dialog-root.tsx";
import { useClose } from "./alert-dialog-root.tsx";

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
    <PressFeedbackContext value={false}>
      <Button {...props} {...useClose(onClick, false)} variant={variant} />
    </PressFeedbackContext>
  );
}
