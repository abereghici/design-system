"use client";

import type { ComponentProps, KeyboardEvent } from "react";

import { focusLast, itemsOf, useMenu } from "../internal/menu/menu.tsx";
import { Slot, mergeProps } from "../internal/slot/slot.tsx";

import styles from "./dropdown-menu.module.css";

export interface TriggerProps extends ComponentProps<"button"> {
  /** Makes its one child (a Button or IconButton) the Trigger. */
  asChild?: boolean;
}

/** Opens the menu on press, Enter, Space or Down Arrow, and at its last item on Up Arrow. */
export function Trigger({ asChild = false, ...props }: TriggerProps) {
  const { overlay } = useMenu();
  const Element = asChild ? Slot : "button";
  const trigger = mergeProps({ className: styles["trigger"] }, overlay.triggerProps(props));

  return (
    <Element
      type={asChild ? undefined : "button"}
      {...trigger}
      id={`${overlay.contentId}-trigger`}
      aria-haspopup="menu"
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        props.onKeyDown?.(event);

        const arrow = event.key === "ArrowDown" || event.key === "ArrowUp";

        if (!arrow || event.currentTarget.getAttribute("aria-disabled") === "true") return;

        event.preventDefault();

        const content = document.getElementById(overlay.contentId);

        if (content === null) return;

        if (overlay.open) {
          itemsOf(content)
            .at(event.key === "ArrowUp" ? -1 : 0)
            ?.focus();

          return;
        }

        if (event.key === "ArrowUp") focusLast.add(content);

        overlay.toggle(true, "trigger-press", event.nativeEvent);
      }}
    />
  );
}
