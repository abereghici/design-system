"use client";

import { createContext, use } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent, PointerEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { byId, returnFocus } from "../floating/floating.ts";
import type { Floating } from "../floating/floating.ts";
import { enabled, textOf } from "../listbox/listbox.tsx";
import { join } from "../slot/slot.tsx";

import styles from "./menu.module.css";

/** `cancel()`: keeps the previous value; a menu `closeOnClick` would close stays open too. */
export type ItemChangeEventDetails = Details<"item-press">;

export interface Menu {
  readonly floating: Floating;
  readonly component: "DropdownMenu" | "ContextMenu";
}

export const MenuContext = createContext<Menu | null>(null);

function useMenu(): Menu {
  const menu = use(MenuContext);
  if (menu === null) throw new Error("Menu parts must be inside their menu's Root");
  return menu;
}

export const focusLast = new WeakSet<Element>();
const enterPressed = new WeakSet<Element>();
const typed = new WeakMap<Element, { text: string; at: number }>();
const TYPEAHEAD_WINDOW = 500;

export const itemsOf = (menu: Element) => [
  ...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
];

function typeahead(menu: HTMLElement, key: string, from: Element | null) {
  const last = typed.get(menu);
  const now = performance.now();
  const text = last !== undefined && now - last.at < TYPEAHEAD_WINDOW ? last.text + key : key;
  typed.set(menu, { text, at: now });
  const items = itemsOf(menu).filter((item) => enabled(item));
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

/** The menu's keyboard, pointer highlight and initial focus; DropdownMenu and ContextMenu add placement. */
export function menuContentProps(menu: Menu) {
  return {
    ...menu.floating.contentProps({
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
          menu.floating.toggle(false, "focus-out", event.nativeEvent);
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
      const target = item !== null && enabled(item) ? item : event.currentTarget;
      if (document.activeElement !== target) target.focus({ preventScroll: true });
    },
  } as const;
}

export interface ItemBaseProps extends ComponentProps<"button"> {
  /** Closes the menu when the item is activated (click, Enter, Space). */
  closeOnClick?: boolean;
  /** Renders `aria-disabled="true"`: arrow keys still reach it, activation is blocked. */
  disabled?: boolean;
}

function close(menu: Menu, event: MouseEvent<HTMLElement>, always: boolean) {
  const entered = enterPressed.delete(event.currentTarget);
  if (!always && !entered) return;
  const content = byId(menu.floating.contentId);
  if (content !== null && menu.floating.toggle(false, "item-press", event.nativeEvent)) {
    returnFocus(content);
  }
}

export function useItem(
  { closeOnClick, disabled = false, className, onKeyDown, ...props }: ItemBaseProps,
  role: "menuitem" | "menuitemcheckbox" | "menuitemradio",
) {
  const menu = useMenu();
  return {
    menu,
    props: {
      type: "button",
      ...props,
      role,
      tabIndex: -1,
      "aria-disabled": disabled ? true : undefined,
      className: join(styles["item"], className),
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.key === "Enter") enterPressed.add(event.currentTarget);
      },
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

export interface ItemProps extends ItemBaseProps {
  /** `danger` for a destructive action, placed last after a Separator. */
  variant?: "default" | "danger";
}

/** An action. With `closeOnClick` (the default) the menu closes before `onClick` runs. */
export function Item({ variant = "default", onClick, ...rest }: ItemProps) {
  const { menu, props, blocked, close: closeMenu } = useItem(rest, "menuitem");
  return (
    <button
      {...props}
      data-variant={variant}
      onClick={(event) => {
        if (blocked(event)) return;
        closeMenu(event);
        onClick?.(event);
        dispatchFeedback(event.currentTarget, "ab-press", {
          component: menu.component,
          reason: "user",
        });
      }}
    />
  );
}
