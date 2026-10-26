"use client";

import { createContext, use, useEffectEvent, useId, useLayoutEffect, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { getDocument, useEvent } from "../events/use-event.ts";
import { isOpen, sourceOf } from "../floating/floating.ts";

export type ChangeReason =
  | "trigger-hover"
  | "trigger-focus"
  | "trigger-press"
  | "escape-key"
  | "none";

/**
 * `cancel()`: skips the show or hide; the Tooltip runs every change itself, so each one can be
 * cancelled.
 */
export type ChangeEventDetails = Details<ChangeReason, Event | undefined>;

type Mode = "pointer" | "focus";

interface Tooltip {
  readonly disabled: boolean;
  readonly contentId: string;
  readonly change: (
    open: boolean,
    reason: ChangeReason,
    event?: SyntheticEvent,
    mode?: Mode,
  ) => void;
}

const TooltipContext = createContext<Tooltip | null>(null);

export function useTooltip(): Tooltip {
  const tooltip = use(TooltipContext);

  if (tooltip === null) throw new Error("Tooltip parts must be inside Tooltip.Root");

  return tooltip;
}

const WARM_WINDOW = 400;

const warmth = { closedAt: Number.NEGATIVE_INFINITY, closeOpen: () => {} };

export const seen = new WeakSet<Element>();

const requested = new Map<string, boolean>();

export const triggerOf = (contentId: string) =>
  document.querySelector(`[aria-describedby~="${CSS.escape(contentId)}"]`);

function show(element: HTMLElement, mode: Mode | undefined) {
  const warm = performance.now() - warmth.closedAt < WARM_WINDOW;

  element.toggleAttribute("data-pointer", mode === "pointer");
  element.toggleAttribute("data-instant", warm || mode === undefined);

  if (mode !== "pointer" || warm) seen.add(element);

  element.showPopover(sourceOf(triggerOf(element.id)));
}

function hide(element: HTMLElement) {
  if (seen.delete(element)) warmth.closedAt = performance.now();

  element.hidePopover();
}

function sync(contentId: string, open: boolean, mode: Mode | undefined, closeOther: () => void) {
  requested.delete(contentId);

  const element = document.getElementById(contentId);

  if (element === null || open === isOpen(element)) return;

  if (!open) {
    hide(element);

    return;
  }

  warmth.closeOpen();
  show(element, mode);
  warmth.closeOpen = closeOther;
}

export interface RootProps {
  /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
  open?: boolean;
  /** Shows it on the first render when it holds its own state. */
  defaultOpen?: boolean;
  /** Called before it opens or closes; `details.cancel()` keeps it as it is. */
  onOpenChange?: (open: boolean, details: ChangeEventDetails) => void;
  /** Turns the Tooltip off, such as when the Trigger already shows the same text. */
  disabled?: boolean;
  /** The Trigger and Content. */
  children?: ReactNode;
}

/**
 * A short label for an icon-only control, often with its shortcut, shown on hover after a short
 * delay and at once on keyboard focus. Screen readers hear it as the control's description. Touch
 * never opens it, so never put essential or interactive content in it; for that, use a Popover.
 */
export function Root({
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
}: RootProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const [mode, setMode] = useState<Mode>();
  const current = (open ?? uncontrolled) && !disabled;
  const contentId = useId();

  function change(next: boolean, reason: ChangeReason, event?: SyntheticEvent, nextMode?: Mode) {
    // The DOM, not `current`: delays, Escape and blur show or hide it between renders.
    if (next === (requested.get(contentId) ?? isOpen(document.getElementById(contentId)))) return;

    if (!requestChange(onOpenChange, next, reason, event?.nativeEvent)) return;

    requested.set(contentId, next);
    setMode(nextMode);
    setUncontrolled(next);
  }

  const closeOther = useEffectEvent(() => {
    document.getElementById(contentId)?.toggleAttribute("data-instant", true);
    change(false, "none");
  });

  useEvent(
    "keydown",
    (event) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      change(false, "escape-key");
    },
    current ? getDocument : null,
    true,
  );

  useLayoutEffect(() => {
    sync(contentId, current, mode, closeOther);
  }, [contentId, current, mode]);

  return <TooltipContext value={{ disabled, contentId, change }}>{children}</TooltipContext>;
}

export const outside = (event: { relatedTarget: EventTarget | null }, element: Element | null) =>
  !(event.relatedTarget instanceof Node && element?.contains(event.relatedTarget) === true);
