"use client";

import { useId } from "react";
import type { ReactNode } from "react";

import "@abereghici/tokens/components/sidebar.css";

import { DisclosureRoot } from "../disclosure/disclosure-root.tsx";
import type { RootProps } from "../disclosure/disclosure-root.tsx";
import { Trigger } from "../disclosure/disclosure-trigger.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./sidebar.module.css";

export type CollapsibleGroupProps = RootProps & {
  /** The group's visible name, which people press to fold and unfold its links. */
  label: ReactNode;
};

/**
 * A Group people fold under its `label`, for long navigation. It is a Disclosure: Enter and Space
 * toggle it, find-in-page opens it when it holds a match, `open` and `onOpenChange` let your state
 * hold it, and every press dispatches a bubbling `ab-toggle`.
 */
export function CollapsibleGroup({ label, children, ...props }: CollapsibleGroupProps) {
  const id = useId();

  return (
    <DisclosureRoot
      component="Sidebar"
      {...mergeProps({ className: styles["collapsible"], "aria-labelledby": id }, props)}
    >
      <Trigger id={id} className={styles["summary"]}>
        {label}
      </Trigger>
      <ul className={styles["list"]}>{children}</ul>
    </DisclosureRoot>
  );
}
