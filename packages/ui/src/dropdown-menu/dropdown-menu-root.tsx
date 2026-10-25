"use client";

import { use } from "react";
import type { ReactNode } from "react";

import { useFloating } from "../floating/floating.ts";
import type { ChangeEventDetails as Details, FloatingOptions } from "../floating/floating.ts";
import { MenuContext } from "../menu/menu.tsx";
import type { Menu } from "../menu/menu.tsx";

export type ChangeReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "item-press"
  | "focus-out"
  | "none";

export type ChangeEventDetails = Details<ChangeReason>;

export function useDropdownMenu(): Menu {
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
