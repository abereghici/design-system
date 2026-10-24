"use client";

import type { ComponentProps, MouseEvent } from "react";

import { XIcon } from "../icon/icons/x.tsx";
import { useLocale } from "../provider/locale.tsx";
import { sheetLabels } from "../sheet/labels.ts";
import { Slot } from "../slot/slot.tsx";

import { dialogLabels } from "./labels.ts";
import { join, useModal } from "./modal.tsx";
import iconButton from "../icon-button/icon-button.module.css";

export interface CloseProps extends Omit<ComponentProps<"button">, "command" | "commandfor"> {
  /** Renders the single child (a Button) as the Close. Without children, Close is the icon-only `x`. */
  asChild?: boolean;
  /** Overrides the Provider's locale for the icon-only button's accessible name. */
  labels?: { close?: string };
}

export function Close({ asChild = false, labels, className, onClick, ...props }: CloseProps) {
  const { id, controller, styles, component } = useModal();
  const locale = useLocale();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    controller.press({
      reason: "close-press",
      event: event.nativeEvent,
      dismiss: asChild ? null : event.currentTarget,
    });
  }

  if (asChild) {
    return <Slot {...props} commandfor={id} command="request-close" onClick={handleClick} />;
  }
  return (
    <button
      type="button"
      aria-label={
        labels?.close ??
        (component === "Sheet"
          ? (locale.labels.sheet ?? sheetLabels)
          : (locale.labels.dialog ?? dialogLabels)
        ).close
      }
      {...props}
      data-size="sm"
      className={join(`${iconButton["root"]} ${styles["close"]}`, className)}
      commandfor={id}
      command="request-close"
      onClick={handleClick}
    >
      <XIcon />
    </button>
  );
}
