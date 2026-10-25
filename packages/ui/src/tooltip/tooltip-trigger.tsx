"use client";

import type { ComponentProps, SyntheticEvent } from "react";

import { byId } from "../floating/floating.ts";
import { Slot } from "../slot/slot.tsx";

import { outside, useTooltip } from "./tooltip-root.tsx";

const pressed = new WeakSet<Element>();

export interface TriggerProps extends ComponentProps<"button"> {
  /** Makes its one child (a Button, IconButton or Link) the Trigger. */
  asChild?: boolean;
}

/** The control the Tooltip describes. It keeps its own name. */
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
