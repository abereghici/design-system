"use client";

import { createContext, use } from "react";
import type { ComponentProps, FocusEvent, MouseEvent, ReactNode, RefObject } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { byId, isOpen, useFloating } from "../floating/floating.ts";
import type {
  ChangeEventDetails as Details,
  Floating,
  FloatingOptions,
} from "../floating/floating.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { useLocale } from "../provider/locale.tsx";
import { popover as popoverLabels } from "../provider/locales/en-US/popover.ts";
import { Slot, join } from "../slot/slot.tsx";
import { pointerMarker } from "../toggle/toggle.ts";

import iconButtonStyles from "../icon-button/icon-button.module.css";
import styles from "./popover.module.css";

export type ChangeReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "close-press"
  | "focus-out"
  | "none";

export type ChangeEventDetails = Details<ChangeReason>;

const PopoverContext = createContext<Floating | null>(null);

function usePopover(): Floating {
  const popover = use(PopoverContext);
  if (popover === null) throw new Error("Popover parts must be inside Popover.Root");
  return popover;
}

export interface RootProps extends FloatingOptions<ChangeReason> {
  children?: ReactNode;
}

/**
 * A non-modal panel of interactive content (filters, a short form) anchored to its Trigger. A
 * press outside, Escape or Close dismisses it, and the page stays usable behind it. Focus stays on
 * the Trigger unless `initialFocus` names a field. For a list of actions use DropdownMenu, for a
 * one-line hint Tooltip, for a blocking task Dialog. Root holds the open state and renders no
 * element.
 */
export function Root({ children, ...options }: RootProps) {
  return <PopoverContext value={useFloating("Popover", options)}>{children}</PopoverContext>;
}

export interface TriggerProps extends ComponentProps<"button"> {
  /** Renders the single child (a Button or IconButton) as the Trigger. */
  asChild?: boolean;
}

/** Opens and closes the Content. */
export function Trigger({ asChild = false, ...props }: TriggerProps) {
  const popover = usePopover();
  const Element = asChild ? Slot : "button";
  const invoker = { commandfor: popover.contentId, command: "toggle-popover" } as const;
  return (
    <Element
      type={asChild ? undefined : "button"}
      {...props}
      {...invoker}
      aria-expanded={popover.open}
      aria-haspopup="dialog"
      onPointerDown={(event) => {
        props.onPointerDown?.(event);
        pointerMarker.onPointerDown(event);
      }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        pointerMarker.onKeyDown(event);
      }}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        props.onClick?.(event);
        if (event.defaultPrevented) return;
        const open = isOpen(byId(popover.contentId));
        if (!popover.request(!open, "trigger-press", event.nativeEvent)) event.preventDefault();
      }}
      onBlur={(event: FocusEvent<HTMLButtonElement>) => {
        props.onBlur?.(event);
        popover.focusOut(event.nativeEvent);
      }}
    />
  );
}

export interface ContentProps extends Omit<ComponentProps<"dialog">, "id" | "open" | "popover"> {
  /** Preferred side; flips to the other one when there is no room. */
  side?: "top" | "bottom";
  /** Alignment against the Trigger; `start` and `end` are logical. */
  align?: "start" | "center" | "end";
  /** Focused when the Popover opens. Without it, focus stays on the Trigger. */
  initialFocus?: RefObject<HTMLElement | null>;
}

/** A non-modal dialog, named by its Title or, without one, by `aria-label`. */
export function Content({
  side = "bottom",
  align = "start",
  initialFocus,
  className,
  ...props
}: ContentProps) {
  const popover = usePopover();
  const { onBeforeToggle, onToggle, ...native } = popover.contentProps;
  return (
    <dialog
      aria-labelledby={props["aria-label"] === undefined ? `${popover.contentId}-title` : undefined}
      {...props}
      {...native}
      data-side={side}
      data-align={align}
      className={join(styles["content"], className)}
      onBeforeToggle={(event) => {
        onBeforeToggle(event);
        initialFocus?.current?.toggleAttribute("autofocus", event.newState === "open");
      }}
      onToggle={onToggle}
    />
  );
}

export interface TitleProps extends ComponentProps<"h2"> {
  /** Renders the single child (another heading level) as the Title. */
  asChild?: boolean;
}

/** Names the Content. */
export function Title({ asChild = false, className, ...props }: TitleProps) {
  const popover = usePopover();
  const Element = asChild ? Slot : "h2";
  return (
    <Element
      id={`${popover.contentId}-title`}
      {...props}
      className={join(styles["title"], className)}
    />
  );
}

export interface CloseProps extends ComponentProps<"button"> {
  /** Renders the single child (a Button) as the Close, in the flow. */
  asChild?: boolean;
  /** Overrides the Provider's locale for the icon Close's accessible name. */
  labels?: { close?: string };
}

/** Closes the Popover. Without `asChild` it is an icon button in the top inline-end corner. */
export function Close({ asChild = false, labels, className, ...props }: CloseProps) {
  const popover = usePopover();
  const locale = useLocale();
  const shared = {
    ...props,
    commandfor: popover.contentId,
    command: "hide-popover" as const,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      props.onClick?.(event);
      if (event.defaultPrevented) return;
      if (!popover.request(false, "close-press", event.nativeEvent)) {
        event.preventDefault();
      } else if (!asChild) {
        dispatchFeedback(event.currentTarget, "ab-dismiss", {
          component: "Popover",
          reason: "user",
        });
      }
    },
  };
  if (asChild) return <Slot {...shared} className={className} />;
  return (
    <button
      type="button"
      aria-label={labels?.close ?? locale.labels.popover?.close ?? popoverLabels.close}
      {...shared}
      data-size="sm"
      className={`${iconButtonStyles["root"]} ${join(styles["close"], className)}`}
    >
      <XIcon size="sm" />
    </button>
  );
}
