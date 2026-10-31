"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/tooltip.css";

import { chain } from "../internal/chain/chain.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { outside, seen, triggerOf, useTooltip } from "./tooltip-root.tsx";
import styles from "./tooltip.module.css";

export interface ContentProps extends Omit<ComponentProps<"div">, "id" | "role" | "popover"> {
  /** The side it prefers; it moves to the other one when there is no room. */
  side?: "top" | "bottom";
  /** Lines it up with the Trigger's start, center or end, following the reading direction. */
  align?: "start" | "center" | "end";
}

/** The short label, optionally followed by an `aria-hidden` Kbd. */
export function Content({ side = "top", align = "center", ...props }: ContentProps) {
  const { contentId, contentRef, change } = useTooltip("Tooltip.Content");

  return (
    <div
      {...mergeProps({ className: styles["content"], ref: contentRef }, props)}
      id={contentId}
      role="tooltip"
      popover="manual"
      data-side={side}
      data-align={align}
      onTransitionStart={chain(props.onTransitionStart, (event) => {
        seen.add(event.currentTarget);
      })}
      onPointerLeave={chain(props.onPointerLeave, (event) => {
        if (outside(event, triggerOf(contentId))) change(false, "trigger-hover", event);
      })}
    />
  );
}
