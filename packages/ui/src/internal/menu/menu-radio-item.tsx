"use client";

import { use } from "react";

import { dispatchFeedback } from "../../events/events.ts";

import { Indicator } from "./menu-item-indicator.tsx";
import { RadioGroupContext } from "./menu-radio-group.tsx";
import { useItem } from "./menu.tsx";
import type { ItemBaseProps } from "./menu.tsx";

export interface RadioItemProps extends ItemBaseProps {
  /** The RadioGroup's `value` when this item is chosen. */
  value: string;
}

/** One choice of a RadioGroup; choosing it closes the menu, unless `closeOnClick` is off. */
export function RadioItem({ value, onClick, children, ...rest }: RadioItemProps) {
  const { menu, props, blocked, close: closeMenu } = useItem(rest, "menuitemradio");
  const group = use(RadioGroupContext);

  if (group === null) throw new Error("RadioItem must be inside a RadioGroup");

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
            reason: "user",
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
