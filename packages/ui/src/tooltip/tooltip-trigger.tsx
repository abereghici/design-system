"use client";

import type {
  ComponentProps,
  FocusEvent,
  KeyboardEvent,
  PointerEvent,
  SyntheticEvent,
} from "react";

import { Slot, mergeProps } from "../internal/slot/slot.tsx";

import { outside, useTooltip } from "./tooltip-root.tsx";

const pressed = new WeakSet<Element>();

export interface TriggerProps extends ComponentProps<"button"> {
  /** Makes its one child (a Button, IconButton or Link) the Trigger. */
  asChild?: boolean;
}

function handlers({ contentRef, change }: ReturnType<typeof useTooltip>) {
  const press = (event: SyntheticEvent<HTMLElement>) => {
    pressed.add(event.currentTarget);
    change(false, "trigger-press", event);
  };

  return {
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "touch" || pressed.has(event.currentTarget)) return;

      change(true, "trigger-hover", event, "pointer");
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      pressed.delete(event.currentTarget);

      if (outside(event, contentRef.current)) change(false, "trigger-hover", event);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (pressed.has(event.currentTarget) || !event.currentTarget.matches(":focus-visible"))
        return;

      change(true, "trigger-focus", event, "focus");
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      pressed.delete(event.currentTarget);
      change(false, "trigger-focus", event);
    },
    onPointerDown: press,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") press(event);
    },
  };
}

/** The control the Tooltip describes. It keeps its own name. */
export function Trigger({
  asChild = false,
  "aria-describedby": describedBy,
  ...props
}: TriggerProps) {
  const tooltip = useTooltip();
  const Element = asChild ? Slot : "button";
  const type = asChild ? undefined : "button";

  if (tooltip.disabled) return <Element type={type} {...props} aria-describedby={describedBy} />;

  const { contentId } = tooltip;

  return (
    <Element
      type={type}
      {...mergeProps(handlers(tooltip), props)}
      aria-describedby={describedBy === undefined ? contentId : `${describedBy} ${contentId}`}
    />
  );
}
