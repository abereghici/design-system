"use client";

import type { ComponentProps, KeyboardEvent } from "react";

import { focusLast, itemsOf } from "../../internal/components/menu/menu-navigation.ts";
import { useMenu } from "../../internal/components/menu/menu.tsx";
import { chain } from "../../internal/utils/chain.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";

import styles from "./dropdown-menu.module.css";

export interface TriggerProps extends ComponentProps<"button"> {
  /** Makes its one child (a Button or IconButton) the Trigger. */
  asChild?: boolean;
}

/** Opens the menu on press, Enter, Space or Down Arrow, and at its last item on Up Arrow. */
export function Trigger({ asChild = false, ...props }: TriggerProps) {
  const { overlay } = useMenu("DropdownMenu.Trigger");
  const Element = asChild ? Slot : "button";
  const trigger = mergeProps({ className: styles["trigger"] }, overlay.triggerProps(props));

  return (
    <Element
      type={asChild ? undefined : "button"}
      {...trigger}
      id={`${overlay.contentId}-trigger`}
      aria-haspopup="menu"
      onKeyDown={chain(props.onKeyDown, (event: KeyboardEvent<HTMLButtonElement>) => {
        const arrow = event.key === "ArrowDown" || event.key === "ArrowUp";

        if (!arrow || event.currentTarget.getAttribute("aria-disabled") === "true") return;

        event.preventDefault();

        const content = event.currentTarget.commandForElement;

        if (content === null) return;

        if (overlay.open) {
          itemsOf(content)
            .at(event.key === "ArrowUp" ? -1 : 0)
            ?.focus();

          return;
        }

        if (event.key === "ArrowUp") focusLast.add(content);

        overlay.toggle(true, "trigger-press", event.nativeEvent);
      })}
    />
  );
}
