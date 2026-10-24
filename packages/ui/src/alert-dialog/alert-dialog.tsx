"use client";

import type { ComponentProps, MouseEvent } from "react";

import { Content as ModalContent, ModalRoot, useModal } from "../dialog/modal.tsx";
import type { Reason, RootProps as ModalRootProps } from "../dialog/modal.tsx";
import { dispatchFeedback } from "../events/events.ts";
import { composeRefs, join } from "../slot/slot.tsx";

import button from "../button/button.module.css";
import styles from "../dialog/dialog.module.css";

export { Description, Title, Trigger } from "../dialog/modal.tsx";
export type { ChangeEventDetails, TitleProps, TriggerProps } from "../dialog/modal.tsx";

export type RootProps = ModalRootProps<Exclude<Reason, "outside-press">>;

/**
 * A modal confirmation of an irreversible action, answered with Cancel or the Action (Escape counts as Cancel); a press on the backdrop does nothing. Reversible actions don't need one: run them and offer Undo in a Toast. For a task with fields, use Dialog.
 */
export function Root(props: RootProps) {
  return <ModalRoot {...props} styles={styles} component="AlertDialog" />;
}

export type ContentProps = Omit<ComponentProps<"dialog">, "open" | "id" | "role">;

export function Content(props: ContentProps) {
  return <ModalContent {...props} role="alertdialog" />;
}

type ButtonProps = Omit<ComponentProps<"button">, "command" | "commandfor">;

function useClose(onClick: ButtonProps["onClick"], dismiss: boolean) {
  const { id, controller } = useModal();
  return {
    type: "button",
    commandfor: id,
    command: "request-close",
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!dismiss) dispatchFeedback(event.currentTarget, "ab-confirm", feedback);
      if (event.defaultPrevented) return;
      controller.press({
        reason: "close-press",
        event: event.nativeEvent,
        dismiss: dismiss ? event.currentTarget : null,
      });
    },
  } as const;
}

const feedback = { component: "AlertDialog", reason: "user" } as const;

// React's autoFocus focuses at mount, while the dialog is closed; the attribute is what the dialog focusing steps read.
const autofocus = (node: HTMLButtonElement | null) => {
  node?.setAttribute("autofocus", "");
};

/** Lays out Cancel and the Action, the Action at the inline end. */
export function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["footer"], className)} />;
}

/** The least destructive answer. It takes focus when the dialog opens. */
export function Cancel({ className, onClick, ref, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      {...useClose(onClick, true)}
      ref={composeRefs(ref, autofocus)}
      data-variant="secondary"
      data-size="md"
      className={join(button["root"], className)}
    />
  );
}

export interface ActionProps extends ButtonProps {
  /** `danger` for destructive actions (Delete, Discard, Revoke). */
  variant?: "primary" | "danger";
}

/** Runs `onClick`, then closes the dialog unless `onOpenChange`'s `details.cancel()` is called. */
export function Action({ variant = "primary", className, onClick, ...props }: ActionProps) {
  return (
    <button
      {...props}
      {...useClose(onClick, false)}
      data-variant={variant}
      data-size="md"
      className={join(button["root"], className)}
    />
  );
}
