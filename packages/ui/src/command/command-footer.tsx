"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { Kbd } from "../kbd/kbd.tsx";
import { mergeProps } from "../slot/slot.tsx";

import { DialogContext } from "./command-root.tsx";
import styles from "./command.module.css";

const hint = (keys: string, label: string) => (
  <span className={styles["hint"]}>
    <Kbd keys={keys} />
    {label}
  </span>
);

export interface FooterProps extends ComponentProps<"div"> {
  /** The words beside the arrow keys, such as "Navigate". */
  navigateLabel?: string;
  /** The words beside Enter, such as "Open". */
  openLabel?: string;
  /** The words beside Escape in a Command.Dialog, such as "Close". */
  closeLabel?: string;
}

/** Teaches the keys (navigate, open, close) to people who can see the palette; each key shows with its words. */
export function Footer({ navigateLabel, openLabel, closeLabel, children, ...props }: FooterProps) {
  const inDialog = use(DialogContext) !== null;
  return (
    <div aria-hidden="true" {...mergeProps({ className: styles["footer"] }, props)}>
      {children ?? (
        <>
          {navigateLabel !== undefined && hint("up+down", navigateLabel)}
          {openLabel !== undefined && hint("enter", openLabel)}
          {inDialog && closeLabel !== undefined && hint("esc", closeLabel)}
        </>
      )}
    </div>
  );
}
