"use client";

import type { ComponentProps } from "react";

import { MenuContent } from "../../internal/components/menu/menu-content.tsx";
import { useMenu } from "../../internal/components/menu/menu.tsx";
import type { AccessibleName } from "../../internal/types/accessible-name.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";

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
      <MenuContent {...mergeProps({ className: styles["content"] }, props)} menu={menu} />
    </>
  );
}
