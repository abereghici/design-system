"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { Kbd } from "../kbd/kbd.tsx";
import { join } from "../slot/slot.tsx";
import { useLabels } from "../ui-provider/locale.tsx";
import { command as commandLabels } from "../ui-provider/locales/en-US/command.ts";

import { DialogContext } from "./command-root.tsx";
import styles from "./command.module.css";

const hint = (keys: string, label: string) => (
  <span className={styles["hint"]}>
    <Kbd keys={keys} />
    {label}
  </span>
);

export interface FooterProps extends ComponentProps<"div"> {
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: { navigate?: string; open?: string; close?: string };
}

/** Teaches the keys (navigate, open, close) to people who can see the palette. */
export function Footer({ labels, className, children, ...props }: FooterProps) {
  const inDialog = use(DialogContext) !== null;
  const text = useLabels("command", commandLabels, labels);
  return (
    <div aria-hidden="true" {...props} className={join(styles["footer"], className)}>
      {children ?? (
        <>
          {hint("up+down", text.navigate)}
          {hint("enter", text.open)}
          {inDialog && hint("esc", text.close)}
        </>
      )}
    </div>
  );
}
