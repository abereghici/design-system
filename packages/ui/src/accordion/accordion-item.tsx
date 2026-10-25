"use client";

import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import { ItemContext, useAccordion } from "./accordion-root.tsx";
import styles from "./accordion.module.css";

export interface ItemProps extends Omit<ComponentProps<"details">, "open" | "name"> {
  value: string;
}

export function Item({ value, className, onToggle, ...props }: ItemProps) {
  const accordion = useAccordion("Item");
  const open = accordion.value.includes(value);
  return (
    <ItemContext value={value}>
      <details
        {...props}
        open={open}
        name={accordion.name}
        className={join(styles["item"], className)}
        onToggle={(event) => {
          onToggle?.(event);
          if (event.currentTarget.open !== open) accordion.change(value, !open, event);
        }}
      />
    </ItemContext>
  );
}
