"use client";

import type { ReactNode } from "react";

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

export interface RootProps extends OverlayOptions<ChangeReason> {
  /** The Trigger and Content. */
  children?: ReactNode;
}

/**
 * A list of actions or options revealed from a button: "Duplicate", "Rename…", "Delete". Arrow
 * keys, Home, End and typing move through the items; Escape, a press outside or Tab closes it. To
 * choose a form value use Select; for the same actions on a right click, ContextMenu; for other
 * content, Popover.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, its
 * Trigger is hidden.
 */
export function Root({ children, ...options }: RootProps) {
  const overlay = useOverlay("DropdownMenu", options);

  return <MenuContext value={{ overlay, component: "DropdownMenu" }}>{children}</MenuContext>;
}
