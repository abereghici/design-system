"use client";

import { createContext, use, useEffectEvent, useId, useLayoutEffect, useState } from "react";
import type { ComponentProps, ReactNode, SyntheticEvent } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { byId, isOpen, sourceOf } from "../floating/floating.ts";
import { Slot, join } from "../slot/slot.tsx";

import styles from "./tooltip.module.css";

export type ChangeReason =
  | "trigger-hover"
  | "trigger-focus"
  | "trigger-press"
  | "escape-key"
  | "none";

/** `cancel()`: skips the show or hide; the Tooltip runs every change itself, so each one can be cancelled. */
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

function useTooltip(): Tooltip {
  const tooltip = use(TooltipContext);
  if (tooltip === null) throw new Error("Tooltip parts must be inside Tooltip.Root");
  return tooltip;
}

const WARM_WINDOW = 400;
const warmth = { closedAt: Number.NEGATIVE_INFINITY, closeOpen: () => {} };
const seen = new WeakSet<Element>();
const pressed = new WeakSet<Element>();
const requested = new Map<string, boolean>();

const triggerOf = (contentId: string) =>
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

function present(
  element: HTMLElement,
  mode: Mode | undefined,
  closeOther: () => void,
  escape: (event: KeyboardEvent) => void,
) {
  warmth.closeOpen();
  show(element, mode);
  warmth.closeOpen = closeOther;
  document.addEventListener("keydown", escape, true);
  return () => {
    document.removeEventListener("keydown", escape, true);
  };
}

export interface RootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: ChangeEventDetails) => void;
  /** No Tooltip at all: no listeners and no `aria-describedby`; an open one closes. */
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * A short label for an icon-only control, often with its shortcut, shown after a short delay on
 * hover and at once on keyboard focus. It describes the Trigger (`aria-describedby`) and never
 * holds interactive or essential content: touch never opens it. For interactive content anchored
 * to a control use Popover. Root holds the open state and renders no element.
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
    if (next === (requested.get(contentId) ?? isOpen(byId(contentId)))) return;
    if (!requestChange(onOpenChange, next, reason, event?.nativeEvent)) return;
    requested.set(contentId, next);
    setMode(nextMode);
    setUncontrolled(next);
  }

  const closeOther = useEffectEvent(() => {
    byId(contentId)?.toggleAttribute("data-instant", true);
    change(false, "none");
  });
  const escape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    change(false, "escape-key");
  });

  useLayoutEffect(() => {
    requested.delete(contentId);
    const element = byId(contentId);
    if (element !== null && !current && isOpen(element)) hide(element);
    const opening = element !== null && current && !isOpen(element);
    return opening ? present(element, mode, closeOther, escape) : undefined;
  }, [contentId, current, mode]);

  return <TooltipContext value={{ disabled, contentId, change }}>{children}</TooltipContext>;
}

export interface TriggerProps extends ComponentProps<"button"> {
  /** Renders the single child (a Button, IconButton or Link) as the Trigger. */
  asChild?: boolean;
}

const outside = (event: { relatedTarget: EventTarget | null }, element: Element | null) =>
  !(event.relatedTarget instanceof Node && element?.contains(event.relatedTarget) === true);

/** The control the Tooltip describes. Its own name stays; the Tooltip becomes its description. */
export function Trigger({
  asChild = false,
  "aria-describedby": describedBy,
  ...props
}: TriggerProps) {
  const { disabled, contentId, change } = useTooltip();
  const Element = asChild ? Slot : "button";
  const type = asChild ? undefined : "button";
  if (disabled) return <Element type={type} {...props} aria-describedby={describedBy} />;
  const press = (event: SyntheticEvent<HTMLElement>) => {
    pressed.add(event.currentTarget);
    change(false, "trigger-press", event);
  };
  return (
    <Element
      type={type}
      {...props}
      aria-describedby={describedBy === undefined ? contentId : `${describedBy} ${contentId}`}
      onPointerEnter={(event) => {
        props.onPointerEnter?.(event);
        if (event.pointerType === "touch" || pressed.has(event.currentTarget)) return;
        change(true, "trigger-hover", event, "pointer");
      }}
      onPointerLeave={(event) => {
        props.onPointerLeave?.(event);
        pressed.delete(event.currentTarget);
        if (outside(event, byId(contentId))) change(false, "trigger-hover", event);
      }}
      onFocus={(event) => {
        props.onFocus?.(event);
        if (pressed.has(event.currentTarget) || !event.currentTarget.matches(":focus-visible"))
          return;
        change(true, "trigger-focus", event, "focus");
      }}
      onBlur={(event) => {
        props.onBlur?.(event);
        pressed.delete(event.currentTarget);
        change(false, "trigger-focus", event);
      }}
      onPointerDown={(event) => {
        props.onPointerDown?.(event);
        press(event);
      }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (event.key === "Enter" || event.key === " ") press(event);
      }}
    />
  );
}

export interface ContentProps extends Omit<ComponentProps<"div">, "id" | "role" | "popover"> {
  /** Preferred side; flips to the other one when there is no room. */
  side?: "top" | "bottom";
  /** Alignment against the Trigger; `start` and `end` are logical. */
  align?: "start" | "center" | "end";
}

/** A short label, optionally followed by an `aria-hidden` Kbd. Never interactive content. */
export function Content({ side = "top", align = "center", className, ...props }: ContentProps) {
  const { contentId, change } = useTooltip();
  return (
    <div
      {...props}
      id={contentId}
      role="tooltip"
      popover="manual"
      data-side={side}
      data-align={align}
      className={join(styles["content"], className)}
      onTransitionStart={(event) => {
        props.onTransitionStart?.(event);
        seen.add(event.currentTarget);
      }}
      onPointerLeave={(event) => {
        props.onPointerLeave?.(event);
        if (outside(event, triggerOf(contentId))) change(false, "trigger-hover", event);
      }}
    />
  );
}
