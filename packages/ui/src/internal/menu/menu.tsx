"use client";

import { createContext, use } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent, PointerEvent } from "react";

import type { ChangeEventDetails as Details } from "../../events/events.ts";
import { textOf } from "../listbox/listbox.tsx";
import { returnFocus } from "../overlay/overlay.ts";
import type { Overlay } from "../overlay/overlay.ts";
import { mergeProps } from "../slot/slot.tsx";

import styles from "./menu.module.css";

/** `cancel()`: keeps the previous value; a menu `closeOnClick` would close stays open too. */
export type ItemChangeEventDetails = Details<"item-press">;

export interface Menu {
  readonly overlay: Overlay;
  readonly component: "DropdownMenu" | "ContextMenu";
}

export const MenuContext = createContext<Menu | null>(null);

export function useMenu(): Menu {
  const menu = use(MenuContext);

  if (menu === null) throw new Error("Menu parts must be inside their menu's Root");

  return menu;
}

export const focusLast = new WeakSet<Element>();

const enterPressed = new WeakSet<Element>();

const typed = new WeakMap<Element, { text: string; at: number }>();

const TYPEAHEAD_WINDOW = 500;

const isDisabled = (item: Element) => item.getAttribute("aria-disabled") === "true";

export const itemsOf = (menu: Element) => [
  ...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
];

function typeahead(menu: HTMLElement, key: string, from: Element | null) {
  const last = typed.get(menu);
  const now = performance.now();
  const text = last !== undefined && now - last.at < TYPEAHEAD_WINDOW ? last.text + key : key;

  typed.set(menu, { text, at: now });

  const items = itemsOf(menu).filter((item) => !isDisabled(item));
  const start = from instanceof HTMLElement ? items.indexOf(from) : -1;
  const repeat = text === key.repeat(text.length) ? key : text;
  const order = [...items.slice(start + 1), ...items.slice(0, start + 1)];

  order.find((item) => textOf(item).toLowerCase().startsWith(repeat.toLowerCase()))?.focus();
}

function navigate(event: KeyboardEvent<HTMLElement>) {
  const items = itemsOf(event.currentTarget);
  const from = event.target instanceof HTMLElement ? items.indexOf(event.target) : -1;
  const steps: Record<string, number | undefined> = {
    ArrowDown: from + 1,
    ArrowUp: from < 0 ? -1 : from - 1,
    Home: 0,
    End: -1,
  };
  const to = steps[event.key];

  if (to === undefined) return false;

  items.at(to % items.length)?.focus();

  return true;
}

/**
 * The menu's keyboard, pointer highlight and initial focus; DropdownMenu and ContextMenu add
 * placement.
 */
export function menuContentProps(menu: Menu) {
  return {
    ...menu.overlay.contentProps({
      onToggle: (event) => {
        if (event.newState !== "open") return;

        const items = itemsOf(event.currentTarget);

        (focusLast.delete(event.currentTarget) ? items.at(-1) : items[0])?.focus();
      },
    }),
    role: "menu",
    tabIndex: -1,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (navigate(event)) {
        event.preventDefault();
      } else if (event.key === "Tab") {
        setTimeout(() => {
          menu.overlay.toggle(false, "focus-out", event.nativeEvent);
        });
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        typeahead(
          event.currentTarget,
          event.key,
          event.target instanceof Element ? event.target : null,
        );
      }
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "touch") return;

      const item =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[role^="menuitem"]')
          : null;
      const target = item !== null && !isDisabled(item) ? item : event.currentTarget;

      if (document.activeElement !== target) target.focus({ preventScroll: true });
    },
  } as const;
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

  const content = document.getElementById(menu.overlay.contentId);

  if (content !== null && menu.overlay.toggle(false, "item-press", event.nativeEvent)) {
    returnFocus(content);
  }
}

export function useItem(
  { closeOnClick, disabled = false, ...props }: ItemBaseProps,
  role: "menuitem" | "menuitemcheckbox" | "menuitemradio",
) {
  const menu = useMenu();

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
