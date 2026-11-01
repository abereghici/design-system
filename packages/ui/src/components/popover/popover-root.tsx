"use client";

import type { ReactNode } from "react";

import { useOverlay } from "../../internal/overlays/overlay.ts";
import type {
  ChangeEventDetails as Details,
  Overlay,
  OverlayOptions,
} from "../../internal/overlays/overlay.ts";
import { createSafeContext } from "../../internal/utils/create-safe-context.ts";

export type ChangeReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "close-press"
  | "focus-out"
  | "none";

export type ChangeEventDetails = Details<ChangeReason>;

export const [PopoverContext, usePopover] = createSafeContext<Overlay>("Popover.Root");

export interface RootProps extends OverlayOptions<ChangeReason> {
  /** The Trigger and Content. */
  children?: ReactNode;
}

/**
 * A panel of interactive content (filters, a short form) next to the control that opens it, while
 * the page stays usable. A press outside, Escape or Close dismisses it. For a list of actions use
 * DropdownMenu, for a one-line hint Tooltip, for a blocking task Dialog.
 *
 * Tier 1: works before hydration.
 */
export function Root({ children, ...options }: RootProps) {
  return <PopoverContext value={useOverlay("Popover", options)}>{children}</PopoverContext>;
}
