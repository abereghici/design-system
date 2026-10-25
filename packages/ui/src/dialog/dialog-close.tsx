"use client";

import type { ComponentProps, MouseEvent, ReactElement } from "react";

import { composeEventHandlers } from "../events/events.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { Slot, mergeProps } from "../slot/slot.tsx";

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
export function Close({ asChild = false, onClick, ...props }: CloseProps) {
  const { id, controller, styles } = useModal();

  const handleClick = composeEventHandlers(onClick, (event: MouseEvent<HTMLButtonElement>) => {
    controller.press({
      reason: "close-press",
      event: event.nativeEvent,
      dismiss: asChild ? null : event.currentTarget,
    });
  });

  if (asChild) {
    return <Slot {...props} commandfor={id} command="request-close" onClick={handleClick} />;
  }

  return (
    <button
      type="button"
      {...mergeProps({ className: `${iconButton["root"]} ${styles["close"]}` }, props)}
      data-size="sm"
      commandfor={id}
      command="request-close"
      onClick={handleClick}
    >
      <XIcon />
    </button>
  );
}
