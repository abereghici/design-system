"use client";

import { createContext, use } from "react";
import type { ComponentProps, MouseEvent, ReactNode, RefObject } from "react";

import { composeEventHandlers, dispatchFeedback } from "../events/events.ts";
import { useFloating } from "../floating/floating.ts";
import type {
  ChangeEventDetails as Details,
  Floating,
  FloatingOptions,
} from "../floating/floating.ts";
import { XIcon } from "../icon/icons/x.tsx";
import { useLabels } from "../provider/locale.tsx";
import { popover as popoverLabels } from "../provider/locales/en-US/popover.ts";
import { Slot, join } from "../slot/slot.tsx";

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
  /** The Trigger and Content. */
  children?: ReactNode;
}

/**
 * A panel of interactive content (filters, a short form) next to the control that opens it, while
 * the page stays usable. A press outside, Escape or Close dismisses it. For a list of actions use
 * DropdownMenu, for a one-line hint Tooltip, for a blocking task Dialog.
 */
export function Root({ children, ...options }: RootProps) {
  return <PopoverContext value={useFloating("Popover", options)}>{children}</PopoverContext>;
}

export interface TriggerProps extends ComponentProps<"button"> {
  /** Makes its one child (a Button or IconButton) the Trigger. */
  asChild?: boolean;
}

/** Opens and closes the Content. */
export function Trigger({ asChild = false, ...props }: TriggerProps) {
  const popover = usePopover();
  const Element = asChild ? Slot : "button";
  return (
    <Element
      type={asChild ? undefined : "button"}
      {...popover.triggerProps(props)}
      aria-haspopup="dialog"
    />
  );
}

export interface ContentProps extends Omit<ComponentProps<"dialog">, "id" | "open" | "popover"> {
  /** The side it prefers; it moves to the other one when there is no room. */
  side?: "top" | "bottom";
  /** Lines it up with the Trigger's start, center or end, following the reading direction. */
  align?: "start" | "center" | "end";
  /**
   * A field to focus when it opens, such as the first filter. Without it, focus stays on the
   * Trigger.
   */
  initialFocus?: RefObject<HTMLElement | null>;
}

/** The panel. Give it a Title, or an `aria-label` when it has none. */
export function Content({
  side = "bottom",
  align = "start",
  initialFocus,
  className,
  ...props
}: ContentProps) {
  const popover = usePopover();
  return (
    <dialog
      aria-labelledby={props["aria-label"] === undefined ? `${popover.contentId}-title` : undefined}
      {...props}
      {...popover.contentProps({
        onBeforeToggle: (event) => {
          initialFocus?.current?.toggleAttribute("autofocus", event.newState === "open");
        },
      })}
      data-side={side}
      data-align={align}
      className={join(styles["content"], className)}
    />
  );
}

export interface TitleProps extends ComponentProps<"h2"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
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
  /** Makes its one child (a Button such as Done) close the Popover. */
  asChild?: boolean;
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: { close?: string };
}

/** Closes the Popover. Without children it is the `x` button in the corner. */
export function Close({ asChild = false, labels, className, ...props }: CloseProps) {
  const popover = usePopover();
  const { close } = useLabels("popover", popoverLabels, labels);
  const shared = {
    ...props,
    commandfor: popover.contentId,
    command: "hide-popover" as const,
    onClick: composeEventHandlers(props.onClick, (event: MouseEvent<HTMLButtonElement>) => {
      if (!popover.request(false, "close-press", event.nativeEvent)) {
        event.preventDefault();
      } else if (!asChild) {
        dispatchFeedback(event.currentTarget, "ab-dismiss", {
          component: "Popover",
          reason: "user",
        });
      }
    }),
  };
  if (asChild) return <Slot {...shared} className={className} />;
  return (
    <button
      type="button"
      aria-label={close}
      {...shared}
      data-size="sm"
      className={`${iconButtonStyles["root"]} ${join(styles["close"], className)}`}
    >
      <XIcon size="sm" />
    </button>
  );
}
