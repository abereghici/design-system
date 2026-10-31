"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";

import "@abereghici/tokens/components/disclosure.css";

import { ChevronDownIcon } from "../icon/icons/chevron-down.tsx";
import { composeEventHandlers } from "../internal/compose-event-handlers/compose-event-handlers.ts";
import { pointerMarker } from "../internal/interaction/pointer-marker.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { useDisclosure } from "./disclosure-root.tsx";
import styles from "./disclosure.module.css";

export interface TriggerProps extends ComponentProps<"summary"> {
  /** Says what the section holds, as its visible name. */
  children: ReactNode;
}

/** The heading button that opens and closes the Content. */
export function Trigger({ children, onClick, ...props }: TriggerProps) {
  const disclosure = useDisclosure("Disclosure.Trigger");

  return (
    <summary
      {...mergeProps({ className: styles["trigger"], ...pointerMarker }, props)}
      onClick={composeEventHandlers(onClick, (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        disclosure.actions.change(!disclosure.state.open, event);
      })}
    >
      {children}
      <ChevronDownIcon size="sm" className={styles["icon"]} />
    </summary>
  );
}
