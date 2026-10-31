"use client";

import type { ComponentProps, MouseEvent, ReactElement } from "react";

import { IconButton } from "../icon-button/icon-button.tsx";
import { XIcon } from "../icon/icons/x.tsx";
import { composeEventHandlers } from "../internal/compose-event-handlers/compose-event-handlers.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { Slot } from "../internal/slot/slot.tsx";

import { useModal } from "./dialog-modal.tsx";

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
export function Close(props: CloseProps) {
  const { id, controller, styles } = useModal("Close");

  const handleClick = composeEventHandlers(
    props.onClick,
    (event: MouseEvent<HTMLButtonElement>) => {
      controller.press({
        reason: "close-press",
        event: event.nativeEvent,
        dismiss: props.asChild === true ? null : event.currentTarget,
      });
    },
  );

  if (props.asChild === true) {
    const { asChild: _, ...child } = props;

    return <Slot {...child} commandfor={id} command="request-close" onClick={handleClick} />;
  }

  return (
    <IconButton
      {...mergeProps({ className: styles["close"] }, props)}
      size="sm"
      commandfor={id}
      command="request-close"
      onClick={handleClick}
    >
      <XIcon />
    </IconButton>
  );
}
