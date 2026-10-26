"use client";

import { use } from "react";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";

import { byId, useFloating } from "../floating/floating.ts";
import type { ChangeEventDetails as Details, FloatingOptions } from "../floating/floating.ts";
import { focusLast, itemsOf, MenuContext, menuContentProps } from "../menu/menu.tsx";
import type { Menu } from "../menu/menu.tsx";
import { join, Slot } from "../slot/slot.tsx";

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
  /** The Trigger and Content. */
  children?: ReactNode;
}

/**
 * A list of actions or options revealed from a button: "Duplicate", "Rename…", "Delete". Arrow
 * keys, Home, End and typing move through the items; Escape, a press outside or Tab closes it. To
 * choose a form value use Select; for the same actions on a right click, ContextMenu; for other
 * content, Popover.
 */
export function Root({ children, ...options }: RootProps) {
  const floating = useFloating("DropdownMenu", options);
  return <MenuContext value={{ floating, component: "DropdownMenu" }}>{children}</MenuContext>;
}

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
        const content = byId(floating.contentId);
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

export interface ContentProps extends Omit<ComponentProps<"div">, "id" | "role" | "popover"> {
  /** The side it prefers; it moves to the other one when there is no room. */
  side?: "top" | "bottom";
  /** Lines the menu up with the Trigger's start or end edge, following the reading direction. */
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
