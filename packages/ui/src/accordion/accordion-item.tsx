"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/accordion.css";

import { DisclosureRoot } from "../disclosure/disclosure-root.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { useAccordion } from "./accordion-root.tsx";
import styles from "./accordion.module.css";

export interface ItemProps extends Omit<ComponentProps<"details">, "open" | "name"> {
  /** Names this Item in the Root's `value`; unique within the Accordion. */
  value: string;
}

/** One collapsible section, holding a Trigger and its Content. */
export function Item({ value, ...props }: ItemProps) {
  const accordion = useAccordion("Accordion.Item");

  return (
    <DisclosureRoot
      component="Accordion"
      {...mergeProps({ className: styles["item"] }, props)}
      name={accordion.name}
      open={accordion.value.includes(value)}
      onOpenChange={(open, details) => {
        if (!accordion.change(value, open, details)) details.cancel();
      }}
    />
  );
}
