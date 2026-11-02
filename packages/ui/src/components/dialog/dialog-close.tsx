"use client";

import type { ComponentProps, MouseEvent, ReactElement } from "react";

import { CloseButton } from "../../internal/components/close-button.tsx";
import { useButton } from "../../internal/interactions/use-button.ts";
import { composeEventHandlers } from "../../internal/utils/compose-event-handlers.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";

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
export function Close({ disabled = false, onClick, ...props }: CloseProps) {
  const asChild = props.asChild === true;
  const { id, controller, styles } = useModal("Close");
  const press = composeEventHandlers(onClick, (event: MouseEvent<HTMLButtonElement>) => {
    controller.press({
      reason: "close-press",
      event: event.nativeEvent,
      dismiss: asChild ? null : event.currentTarget,
    });
  });
  const button = useButton<HTMLButtonElement>({ disabled, onClick: press });

  if (asChild) {
    const { asChild: _, ...child } = props;

    return <Slot {...mergeProps(button, child)} commandfor={id} command="request-close" />;
  }

  const { asChild: _, ...own } = props;

  return (
    <CloseButton
      {...mergeProps({ className: styles["close"] }, own)}
      disabled={disabled}
      onClick={press}
      commandfor={id}
      command="request-close"
      iconSize="md"
    />
  );
}
