"use client";

import { use } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent, ReactNode } from "react";

import { byId, isOpen, useFloating } from "../floating/floating.ts";
import type { ChangeEventDetails as Details, FloatingOptions } from "../floating/floating.ts";
import { focusLast, itemsOf, join, MenuContext, menuContentProps } from "../menu/menu.tsx";
import type { Menu } from "../menu/menu.tsx";
import { Slot } from "../slot/slot.tsx";
import { pointerMarker } from "../toggle/toggle.ts";

import menuStyles from "../menu/menu.module.css";
import styles from "./dropdown-menu.module.css";

export type ChangeReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "item-press"
  | "focus-out"
  | "none";

export type ChangeEventDetails = Details<ChangeReason>;

function useDropdownMenu(): Menu {
  const menu = use(MenuContext);
  if (menu === null) throw new Error("DropdownMenu parts must be inside DropdownMenu.Root");
  return menu;
}

export interface RootProps extends FloatingOptions<ChangeReason> {
  children?: ReactNode;
}

/**
 * A list of actions or options revealed from a button: "Duplicate", "Rename…", "Delete". Arrow
 * keys, Home, End and typing move through the items; Escape, a press outside or Tab closes it. To
 * choose a form value use Select; for the same actions on a right click use ContextMenu; for
 * arbitrary content use Popover. Root holds the open state and renders no element.
 */
export function Root({ children, ...options }: RootProps) {
  const floating = useFloating("DropdownMenu", options);
  return <MenuContext value={{ floating, component: "DropdownMenu" }}>{children}</MenuContext>;
}

export interface TriggerProps extends ComponentProps<"button"> {
  /** Renders the single child (a Button or IconButton) as the Trigger. */
  asChild?: boolean;
}

/** Opens the menu on press, Enter, Space or Down Arrow, and at its last item on Up Arrow. */
export function Trigger({ asChild = false, ...props }: TriggerProps) {
  const { floating } = useDropdownMenu();
  const Element = asChild ? Slot : "button";
  const invoker = { commandfor: floating.contentId, command: "toggle-popover" } as const;
  return (
    <Element
      type={asChild ? undefined : "button"}
      {...props}
      {...invoker}
      id={`${floating.contentId}-trigger`}
      aria-haspopup="menu"
      aria-expanded={floating.open}
      onPointerDown={(event) => {
        props.onPointerDown?.(event);
        pointerMarker.onPointerDown(event);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        props.onKeyDown?.(event);
        pointerMarker.onKeyDown(event);
        const arrow = event.key === "ArrowDown" || event.key === "ArrowUp";
        if (!arrow || event.currentTarget.getAttribute("aria-disabled") === "true") return;
        event.preventDefault();
        const content = byId(floating.contentId);
        if (content === null) return;
        if (isOpen(content)) {
          itemsOf(content)
            .at(event.key === "ArrowUp" ? -1 : 0)
            ?.focus();
          return;
        }
        if (event.key === "ArrowUp") focusLast.add(content);
        floating.toggle(true, "trigger-press", event.nativeEvent);
      }}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        props.onClick?.(event);
        if (event.defaultPrevented) return;
        const open = isOpen(byId(floating.contentId));
        if (!floating.request(!open, "trigger-press", event.nativeEvent)) event.preventDefault();
      }}
      onBlur={(event) => {
        props.onBlur?.(event);
        floating.focusOut(event.nativeEvent);
      }}
    />
  );
}

export interface ContentProps extends Omit<ComponentProps<"div">, "id" | "role" | "popover"> {
  /** Preferred side; flips to the other one when there is no room. */
  side?: "top" | "bottom";
  /** Logical: `start` lines the menu up with the Trigger's inline-start edge. */
  align?: "start" | "end";
}

/** The menu, named by its Trigger and at least as wide as it. */
export function Content({ side = "bottom", align = "start", className, ...props }: ContentProps) {
  const menu = useDropdownMenu();
  return (
    <div
      {...props}
      {...menuContentProps(menu)}
      aria-labelledby={`${menu.floating.contentId}-trigger`}
      data-side={side}
      data-align={align}
      className={join(`${menuStyles["content"]} ${styles["content"]}`, className)}
    />
  );
}
