"use client";

import type { ComponentProps } from "react";

import { menuContentProps } from "../menu/menu.tsx";
import { join } from "../slot/slot.tsx";

import { useContextMenu } from "./context-menu-root.tsx";
import menuStyles from "../menu/menu.module.css";
import styles from "./context-menu.module.css";

type Naming = { "aria-label": string } | { "aria-labelledby": string };

export type ContentProps = Omit<ComponentProps<"div">, "id" | "role" | "popover"> & Naming;

/** The menu, opened at the pointer and kept inside the window. */
export function Content({ className, ...props }: ContentProps) {
  const menu = useContextMenu();
  return (
    <>
      <span id={`${menu.floating.contentId}-anchor`} aria-hidden className={styles["anchor"]} />
      <div
        {...props}
        {...menuContentProps(menu)}
        className={join(`${menuStyles["content"]} ${styles["content"]}`, className)}
      />
    </>
  );
}
