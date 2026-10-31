"use client";

import { dispatchFeedback } from "../../feedback-event/feedback-event.ts";

import { Indicator } from "./menu-item-indicator.tsx";
import { useMenuRadioGroup } from "./menu-radio-group.tsx";
import { useItem } from "./menu.tsx";
import type { ItemBaseProps } from "./menu.tsx";

export interface RadioItemProps extends ItemBaseProps {
  /** The RadioGroup's `value` when this item is chosen. */
  value: string;
}

/** One choice of a RadioGroup; choosing it closes the menu, unless `closeOnClick` is off. */
export function RadioItem({ value, onClick, children, ...rest }: RadioItemProps) {
  const { menu, props, blocked, close: closeMenu } = useItem(rest, "menuitemradio");
  const group = useMenuRadioGroup("RadioItem");

  const checked = group.value === value;

  return (
    <button
      {...props}
      role="menuitemradio"
      aria-checked={checked}
      onClick={(event) => {
        if (blocked(event)) return;

        onClick?.(event);

        if (!checked) {
          if (!group.select(value, event)) return;

          dispatchFeedback(event.currentTarget, "ab-toggle", {
            component: menu.component,
            userInitiated: true,
          });
        }

        closeMenu(event);
      }}
    >
      <Indicator checked={checked} radio />
      {children}
    </button>
  );
}
