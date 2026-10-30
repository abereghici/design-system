"use client";

import { use } from "react";
import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/accordion.css";

import { composeEventHandlers, pointerMarker } from "../events/events.ts";
import { ChevronDownIcon } from "../icon/icons/chevron-down.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

import { ItemContext, useAccordion } from "./accordion-root.tsx";
import styles from "./accordion.module.css";

export type TriggerProps = ComponentProps<"summary">;

/** The heading button that opens and closes its Item. */
export function Trigger({ children, onClick, ...props }: TriggerProps) {
  const accordion = useAccordion("Trigger");
  const item = use(ItemContext);

  if (item === null) throw new Error("Accordion.Trigger must be inside Accordion.Item");

  return (
    <summary
      {...mergeProps({ className: styles["trigger"], ...pointerMarker }, props)}
      onClick={composeEventHandlers(onClick, (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        accordion.change(item, !accordion.value.includes(item), event);
      })}
    >
      {children}
      <ChevronDownIcon size="sm" className={styles["icon"]} />
    </summary>
  );
}
