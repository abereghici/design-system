"use client";

import { createPortal } from "react-dom";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/toast.css";
import "@abereghici/tokens/components/kbd.css";

import { Layer } from "./toaster-layer.tsx";
import { useTopmostModal } from "./use-topmost-modal.ts";

export interface ToasterProps extends Omit<
  ComponentProps<"section">,
  "popover" | "tabIndex" | "aria-label" | "aria-keyshortcuts" | "children"
> {
  /** The name of the toasts' region, such as "Notifications", which people can jump to. */
  "aria-label": string;
  /** The name of each toast's close button, such as "Dismiss": it shows only an icon. */
  closeLabel: string;
}

/**
 * Shows the toasts added with `toast()` from `@abereghici/ui/toast`, stacked at the bottom of the
 * screen, timed and announced to screen readers. Mount exactly one, near the root inside the
 * UIProvider. Toasts stay usable while a dialog is open.
 *
 * Tier 2: shows its final content before hydration and works after it.
 */
export function Toaster(props: ToasterProps) {
  const modal = useTopmostModal();

  return modal === null ? <Layer {...props} /> : createPortal(<Layer {...props} />, modal);
}
