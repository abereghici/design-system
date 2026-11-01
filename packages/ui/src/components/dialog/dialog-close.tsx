"use client";

import "@abereghici/tokens/components/icon-button.css";

import type { ComponentProps, MouseEvent, ReactElement } from "react";

import { useButton } from "../../internal/interactions/use-button.ts";
import { composeEventHandlers } from "../../internal/utils/compose-event-handlers.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";
import { XIcon } from "../icon/icons/x.tsx";

import { useModal } from "./dialog-modal.tsx";
import iconButton from "../icon-button/icon-button.module.css";

interface CloseBase {
  /** Makes its one child (a Button such as Cancel) close the dialog. */
  asChild?: boolean;
  /** The name of the `x` button, such as "Close": it shows only an icon. */
  "aria-label"?: string;
  /** With `asChild`, the one child that closes it. */
  children?: ReactElement;
}

type Shape =
  | { asChild: true; children: ReactElement }
  | { asChild?: false; "aria-label": string; children?: never };

export type CloseProps = Omit<
  ComponentProps<"button">,
  "command" | "commandfor" | "aria-label" | "children"
> &
  CloseBase &
  Shape;

/** Closes the dialog: the `x` button, or with `asChild` its one child. */
export function Close({ asChild = false, disabled = false, onClick, ...props }: CloseProps) {
  const { id, controller, styles } = useModal("Close");
  const button = useButton<HTMLButtonElement>({
    disabled,
    onClick: composeEventHandlers(onClick, (event: MouseEvent<HTMLButtonElement>) => {
      controller.press({
        reason: "close-press",
        event: event.nativeEvent,
        dismiss: asChild ? null : event.currentTarget,
      });
    }),
  });

  if (asChild)
    return <Slot {...mergeProps(button, props)} commandfor={id} command="request-close" />;

  return (
    <button
      type="button"
      {...mergeProps({ className: `${iconButton["root"]} ${styles["close"]}`, ...button }, props)}
      data-size="sm"
      commandfor={id}
      command="request-close"
    >
      <XIcon />
    </button>
  );
}
