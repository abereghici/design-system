"use client";

import type { ComponentProps, KeyboardEvent, MouseEvent } from "react";

import { returnFocus } from "../../overlays/overlay.ts";
import type { Overlay } from "../../overlays/overlay.ts";
import type { ChangeEventDetails as Details } from "../../state/change-request.ts";
import { createSafeContext } from "../../utils/create-safe-context.ts";
import { mergeProps } from "../../utils/merge-props.ts";

import styles from "./menu.module.css";

/** `cancel()`: keeps the previous value; a menu `closeOnClick` would close stays open too. */
export type ItemChangeEventDetails = Details<"item-press">;

export interface Menu {
  readonly overlay: Overlay;
  readonly component: "DropdownMenu" | "ContextMenu";
}

export const [MenuContext, useMenu] = createSafeContext<Menu>(
  "DropdownMenu.Root or ContextMenu.Root",
);

const enterPressed = new WeakSet<Element>();

export interface ItemBaseProps extends ComponentProps<"button"> {
  /** Closes the menu once the item is chosen; turn it off to let people choose several in a row. */
  closeOnClick?: boolean;
  /** Keeps the item visible and reachable with the arrow keys, but it can't be chosen. */
  disabled?: boolean;
}

function close(menu: Menu, event: MouseEvent<HTMLElement>, always: boolean) {
  const entered = enterPressed.delete(event.currentTarget);

  if (!always && !entered) return;

  const content = event.currentTarget.closest<HTMLElement>('[role="menu"]');

  if (content !== null && menu.overlay.toggle(false, "item-press", event.nativeEvent)) {
    returnFocus(content);
  }
}

export function useItem(
  { closeOnClick, disabled = false, ...props }: ItemBaseProps,
  role: "menuitem" | "menuitemcheckbox" | "menuitemradio",
) {
  const menu = useMenu("Menu items");

  return {
    menu,
    props: {
      ...mergeProps(
        {
          type: "button",
          className: styles["item"],
          onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === "Enter") enterPressed.add(event.currentTarget);
          },
        },
        props,
      ),
      role,
      tabIndex: -1,
      "aria-disabled": disabled ? true : undefined,
    } as const,
    blocked: (event: MouseEvent<HTMLButtonElement>) => {
      if (!disabled) return false;

      event.preventDefault();

      return true;
    },
    close: (event: MouseEvent<HTMLButtonElement>) => {
      close(menu, event, closeOnClick ?? role === "menuitem");
    },
  };
}
