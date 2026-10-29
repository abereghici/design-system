"use client";

import { createContext, use } from "react";
import type { ReactNode } from "react";

import { useOverlay } from "../internal/overlay/overlay.ts";
import type {
  ChangeEventDetails as Details,
  Overlay,
  OverlayOptions,
} from "../internal/overlay/overlay.ts";

export type ChangeReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "close-press"
  | "focus-out"
  | "none";

export type ChangeEventDetails = Details<ChangeReason>;

const PopoverContext = createContext<Overlay | null>(null);

export function usePopover(): Overlay {
  const popover = use(PopoverContext);

  if (popover === null) throw new Error("Popover parts must be inside Popover.Root");

  return popover;
}

export interface RootProps extends OverlayOptions<ChangeReason> {
  /** The Trigger and Content. */
  children?: ReactNode;
}

/**
 * A panel of interactive content (filters, a short form) next to the control that opens it, while
 * the page stays usable. A press outside, Escape or Close dismisses it. For a list of actions use
 * DropdownMenu, for a one-line hint Tooltip, for a blocking task Dialog.
 */
export function Root({ children, ...options }: RootProps) {
  return <PopoverContext value={useOverlay("Popover", options)}>{children}</PopoverContext>;
}
