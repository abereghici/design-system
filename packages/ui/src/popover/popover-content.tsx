"use client";

import type { ComponentProps, RefObject } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import { usePopover } from "./popover-root.tsx";
import styles from "./popover.module.css";

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
  ...props
}: ContentProps) {
  const popover = usePopover();

  return (
    <dialog
      aria-labelledby={props["aria-label"] === undefined ? `${popover.contentId}-title` : undefined}
      {...mergeProps(
        {
          className: styles["content"],
          ...popover.contentProps({
            onBeforeToggle: (event) => {
              initialFocus?.current?.toggleAttribute("autofocus", event.newState === "open");
            },
          }),
        },
        props,
      )}
      data-side={side}
      data-align={align}
    />
  );
}
