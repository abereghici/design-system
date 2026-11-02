"use client";

import type { ComponentProps } from "react";

import { IconButton } from "../../components/icon-button/icon-button.tsx";
import { XIcon } from "../../components/icon/icons/x.tsx";
import { PressFeedbackContext } from "../interactions/use-press-feedback.ts";
import type { InvokerCommands } from "../types/invoker-commands.ts";

export type CloseButtonProps = Omit<ComponentProps<"button">, "aria-label" | "children"> &
  InvokerCommands & {
    "aria-label": string;
    /** The size of its `x`, as Mantine's `CloseButton` takes one. */
    iconSize?: "sm" | "md";
  };

/**
 * The small `x` IconButton that closes an Alert, a Dialog or a Popover, as Mantine's `CloseButton`.
 * Its Part reports what the press means (`ab-dismiss`), so it dispatches no `ab-press` of its own.
 */
export function CloseButton({ iconSize = "sm", ...props }: CloseButtonProps) {
  return (
    <PressFeedbackContext value={false}>
      <IconButton {...props} size="sm">
        <XIcon size={iconSize} />
      </IconButton>
    </PressFeedbackContext>
  );
}
