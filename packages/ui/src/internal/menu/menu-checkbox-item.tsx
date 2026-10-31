"use client";

import { dispatchFeedback } from "../../events/events.ts";
import { useControllableState } from "../../events/use-controllable-state.ts";

import { Indicator } from "./menu-item-indicator.tsx";
import { useItem } from "./menu.tsx";
import type { ItemBaseProps, ItemChangeEventDetails } from "./menu.tsx";

export interface CheckboxItemProps extends ItemBaseProps {
  /** Whether it is on, when your state holds it; pair it with `onCheckedChange`. */
  checked?: boolean;
  /** Whether it starts on when it holds its own state. */
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
  const [current, request] = useControllableState(checked, defaultChecked, onCheckedChange);

  return (
    <button
      {...props}
      role="menuitemcheckbox"
      aria-checked={current}
      onClick={(event) => {
        if (blocked(event)) return;

        onClick?.(event);

        if (!request(!current, "item-press", event.nativeEvent)) return;

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
