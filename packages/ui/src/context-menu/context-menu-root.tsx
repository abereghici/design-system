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

export function useContextMenu(): Menu {
  const menu = use(MenuContext);
  if (menu === null) throw new Error("ContextMenu parts must be inside ContextMenu.Root");
  return menu;
}

/**
 * Moves the fixed anchor to a viewport point, measured so a transformed ancestor cannot offset it.
 */
export function place(anchor: HTMLElement, x: number, y: number, pointer: boolean) {
  anchor.style.left = "0";
  anchor.style.top = "0";
  const origin = anchor.getBoundingClientRect();
  anchor.style.left = `${x - origin.left}px`;
  anchor.style.top = `${y - origin.top}px`;
  anchor.toggleAttribute("data-pointer", pointer);
  return anchor;
}

function cornerAnchor(contentId: string) {
  const anchor = document.getElementById(`${contentId}-anchor`);
  const area = document.getElementById(`${contentId}-area`);
  if (anchor === null || area === null) return anchor;
  const rect = area.getBoundingClientRect();
  return place(anchor, area.matches(":dir(rtl)") ? rect.right : rect.left, rect.top, false);
}

export interface RootProps extends FloatingOptions<ChangeReason> {
  /** The Trigger and Content. */
  children?: ReactNode;
}

/**
 * The same menu as DropdownMenu, opened by a right click or a long press on an area, or by the
 * keyboard's context-menu key. It is a shortcut, never the only way to an action: put the same items
 * in a visible control too.
 */
export function Root({ children, ...options }: RootProps) {
  const floating = useFloating("ContextMenu", options, cornerAnchor);
  return <MenuContext value={{ floating, component: "ContextMenu" }}>{children}</MenuContext>;
}
