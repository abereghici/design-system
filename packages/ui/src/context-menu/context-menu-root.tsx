"use client";

import type { ReactNode } from "react";

import { getById } from "../internal/get-by-id/get-by-id.ts";
import { MenuContext } from "../internal/menu/menu.tsx";
import { useOverlay } from "../internal/overlay/overlay.ts";
import type { ChangeEventDetails as Details, OverlayOptions } from "../internal/overlay/overlay.ts";

export type ChangeReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "item-press"
  | "focus-out"
  | "none";

export type ChangeEventDetails = Details<ChangeReason>;

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

const focusBefore = new WeakMap<Element, Element | null>();

/**
 * Records where focus was before a press that may open the menu moved it (WebKit blurs on press),
 * for the menu to return it there.
 */
export function rememberFocus(contentId: string) {
  const content = getById(contentId);

  if (content !== null) focusBefore.set(content, document.activeElement);
}

/** Where focus returns once the menu closes: where it was before the press that opened it. */
function returnTo(content: Element) {
  const focus = focusBefore.get(content) ?? document.activeElement;

  focusBefore.delete(content);

  return focus;
}

function cornerAnchor(contentId: string) {
  const anchor = getById(`${contentId}-anchor`);
  const area = getById(`${contentId}-area`);

  if (anchor === null || area === null) return anchor;

  const rect = area.getBoundingClientRect();

  return place(anchor, area.matches(":dir(rtl)") ? rect.right : rect.left, rect.top, false);
}

export interface RootProps extends OverlayOptions<ChangeReason> {
  /** The Trigger and Content. */
  children?: ReactNode;
}

/**
 * The same menu as DropdownMenu, opened by a right click or a long press on an area, or by the
 * keyboard's context-menu key. It is a shortcut, never the only way to an action: put the same items
 * in a visible control too.
 *
 * Tier 2: shows its final content before hydration and works after it.
 */
export function Root({ children, ...options }: RootProps) {
  const overlay = useOverlay("ContextMenu", options, {
    source: cornerAnchor,
    returnTo,
    pointer: (source) => source?.matches("[data-pointer]") === true,
  });

  return <MenuContext value={{ overlay, component: "ContextMenu" }}>{children}</MenuContext>;
}
