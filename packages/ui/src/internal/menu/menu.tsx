"use client";

import type { ComponentProps, KeyboardEvent, MouseEvent } from "react";

import type { ChangeEventDetails as Details } from "../change-request/change-request.ts";
import { createSafeContext } from "../create-safe-context/create-safe-context.ts";
import { mergeProps } from "../merge-props/merge-props.ts";
import { returnFocus } from "../overlay/overlay.ts";
import type { Overlay } from "../overlay/overlay.ts";

import { menuNavigation } from "./menu-navigation.ts";
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

/**
 * The menu's keyboard, pointer highlight and initial focus; DropdownMenu and ContextMenu add
 * placement.
 */
export function menuContentProps(menu: Menu) {
  const { onToggle, ...navigation } = menuNavigation;

  return mergeProps(
    {
      ...menu.overlay.contentProps({ onToggle }),
      role: "menu",
      tabIndex: -1,
      ...navigation,
    } as const,
    {
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Tab") return;

        setTimeout(() => {
          menu.overlay.toggle(false, "focus-out", event.nativeEvent);
        });
      },
    },
  );
}

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
