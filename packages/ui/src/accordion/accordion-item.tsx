"use client";

import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import { ItemContext, useAccordion } from "./accordion-root.tsx";
import styles from "./accordion.module.css";

export interface ItemProps extends Omit<ComponentProps<"details">, "open" | "name"> {
  /** Names this Item in the Root's `value`; unique within the Accordion. */
  value: string;
}

/** One collapsible section, holding a Trigger and its Content. */
export function Item({ value, onToggle, ...props }: ItemProps) {
  const accordion = useAccordion("Item");
  const open = accordion.value.includes(value);

  return (
    <ItemContext value={value}>
      <details
        {...mergeProps({ className: styles["item"] }, props)}
        open={open}
        name={accordion.name}
        onToggle={(event) => {
          onToggle?.(event);

          if (event.currentTarget.open !== open) accordion.change(value, !open, event);
        }}
      />
    </ItemContext>
  );
}
