"use client";

import { dispatchFeedback } from "../../events/events.ts";

import type { ItemBaseProps } from "./menu.tsx";
import { useItem } from "./menu.tsx";

export interface ItemProps extends ItemBaseProps {
  /** `danger` for a destructive action, placed last after a Separator. */
  variant?: "default" | "danger";
}

/** An action. The menu closes before your `onClick` runs, unless `closeOnClick` is off. */
export function Item({ variant = "default", onClick, ...rest }: ItemProps) {
  const { menu, props, blocked, close: closeMenu } = useItem(rest, "menuitem");

  return (
    <button
      {...props}
      data-variant={variant}
      onClick={(event) => {
        if (blocked(event)) return;

        closeMenu(event);
        onClick?.(event);
        dispatchFeedback(event.currentTarget, "ab-press", {
          component: menu.component,
          reason: "user",
        });
      }}
    />
  );
}
