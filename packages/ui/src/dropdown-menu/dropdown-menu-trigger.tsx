"use client";

import type { ComponentProps, KeyboardEvent } from "react";

import { focusLast, itemsOf } from "../menu/menu.tsx";
import { Slot } from "../slot/slot.tsx";

import { useDropdownMenu } from "./dropdown-menu-root.tsx";

export interface TriggerProps extends ComponentProps<"button"> {
  /** Makes its one child (a Button or IconButton) the Trigger. */
  asChild?: boolean;
}

/** Opens the menu on press, Enter, Space or Down Arrow, and at its last item on Up Arrow. */
export function Trigger({ asChild = false, ...props }: TriggerProps) {
  const { floating } = useDropdownMenu();
  const Element = asChild ? Slot : "button";
  const trigger = floating.triggerProps(props);

  return (
    <Element
      type={asChild ? undefined : "button"}
      {...trigger}
      id={`${floating.contentId}-trigger`}
      aria-haspopup="menu"
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        props.onKeyDown?.(event);

        const arrow = event.key === "ArrowDown" || event.key === "ArrowUp";

        if (!arrow || event.currentTarget.getAttribute("aria-disabled") === "true") return;

        event.preventDefault();

        const content = document.getElementById(floating.contentId);

        if (content === null) return;

        if (floating.open) {
          itemsOf(content)
            .at(event.key === "ArrowUp" ? -1 : 0)
            ?.focus();

          return;
        }

        if (event.key === "ArrowUp") focusLast.add(content);

        floating.toggle(true, "trigger-press", event.nativeEvent);
      }}
    />
  );
}
