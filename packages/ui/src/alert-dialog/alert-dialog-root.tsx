"use client";

import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/dialog.css";

import type { Reason } from "../dialog/dialog-controller.ts";
import { Modal, useModal } from "../dialog/dialog-modal.tsx";
import type { RootProps as ModalProps } from "../dialog/dialog-modal.tsx";
import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import { composeEventHandlers } from "../internal/compose-event-handlers/compose-event-handlers.ts";

import styles from "../dialog/dialog.module.css";

export type RootProps = ModalProps<Exclude<Reason, "outside-press">>;

/**
 * A modal confirmation of an irreversible action, answered with Cancel or the Action (Escape counts as Cancel); a press on the backdrop does nothing. Reversible actions don't need one: run them and offer Undo in a Toast. For a task with fields, use Dialog.
 *
 * Tier 1: works before hydration.
 */
export function Root(props: RootProps) {
  return <Modal {...props} styles={styles} component="AlertDialog" />;
}

export type ButtonProps = Omit<ComponentProps<"button">, "command" | "commandfor">;

export function useClose(onClick: ButtonProps["onClick"], dismiss: boolean) {
  const { id, controller } = useModal(dismiss ? "AlertDialog.Cancel" : "AlertDialog.Action");

  return {
    type: "button",
    commandfor: id,
    command: "request-close",
    onClick: composeEventHandlers(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (!dismiss) dispatchFeedback(event.currentTarget, "ab-confirm", feedback);
      },
      (event) => {
        controller.press({
          reason: "close-press",
          event: event.nativeEvent,
          dismiss: dismiss ? event.currentTarget : null,
        });
      },
    ),
  } as const;
}

const feedback = { component: "AlertDialog", userInitiated: true } as const;
