"use client";

import type { ComponentProps, MouseEvent } from "react";

import { XIcon } from "../icon/icons/x.tsx";
import { useLabels } from "../provider/locale.tsx";
import { dialog as dialogLabels } from "../provider/locales/en-US/dialog.ts";
import { sheet as sheetLabels } from "../provider/locales/en-US/sheet.ts";
import { Slot, join } from "../slot/slot.tsx";

import { useModal } from "./modal.tsx";
import iconButton from "../icon-button/icon-button.module.css";

export interface CloseProps extends Omit<ComponentProps<"button">, "command" | "commandfor"> {
  /**
   * Makes its one child (a Button such as Cancel) close the dialog. Without children it is the `x`
   * button.
   */
  asChild?: boolean;
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: { close?: string };
}

export function Close({ asChild = false, labels, className, onClick, ...props }: CloseProps) {
  const { id, controller, styles, component } = useModal();
  const names = useLabels(
    component === "Sheet" ? "sheet" : "dialog",
    component === "Sheet" ? sheetLabels : dialogLabels,
    labels,
  );

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    // A canceled click does not run the button's command (HTML: no activation behavior for a canceled click).
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
      aria-label={names.close}
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
