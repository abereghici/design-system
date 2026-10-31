"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/context-menu.css";

import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import { menuContentProps, useMenu } from "../internal/menu/menu.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import menuStyles from "../internal/menu/menu.module.css";
import styles from "./context-menu.module.css";

export type ContentProps = Omit<
  ComponentProps<"div">,
  "id" | "role" | "popover" | "aria-label" | "aria-labelledby"
> &
  AccessibleName;

/** The menu, opened at the pointer and kept inside the window. */
export function Content(props: ContentProps) {
  const menu = useMenu("ContextMenu.Content");

  return (
    <>
      <span id={`${menu.overlay.contentId}-anchor`} aria-hidden className={styles["anchor"]} />
      <div
        {...mergeProps(
          { className: `${menuStyles["content"]} ${styles["content"]}`, ...menuContentProps(menu) },
          props,
        )}
      />
    </>
  );
}
