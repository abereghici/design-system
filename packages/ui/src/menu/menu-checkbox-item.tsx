"use client";

import { useState } from "react";

import { dispatchFeedback, requestChange } from "../events/events.ts";

import { Indicator } from "./menu-item-indicator.tsx";
import { useItem } from "./menu.tsx";
import type { ItemBaseProps, ItemChangeEventDetails } from "./menu.tsx";

export interface CheckboxItemProps extends ItemBaseProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Called before the change commits; `details.cancel()` keeps the current state. */
  onCheckedChange?: (checked: boolean, details: ItemChangeEventDetails) => void;
}

/** A setting that turns on and off; the menu stays open unless `closeOnClick`. */
export function CheckboxItem({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onClick,
  children,
  ...rest
}: CheckboxItemProps) {
  const { menu, props, blocked, close: closeMenu } = useItem(rest, "menuitemcheckbox");
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const current = checked ?? uncontrolled;
  return (
    <button
      {...props}
      role="menuitemcheckbox"
      aria-checked={current}
      onClick={(event) => {
        if (blocked(event)) return;
        onClick?.(event);
        if (!requestChange(onCheckedChange, !current, "item-press", event.nativeEvent)) return;
        setUncontrolled(!current);
        dispatchFeedback(event.currentTarget, "ab-toggle", {
          component: menu.component,
          reason: "user",
        });
        closeMenu(event);
      }}
    >
      <Indicator checked={current} radio={false} />
      {children}
    </button>
  );
}
