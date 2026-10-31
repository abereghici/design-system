"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/context-menu.css";

import { menuContentProps, useMenu } from "../internal/menu/menu.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import menuStyles from "../internal/menu/menu.module.css";
import styles from "./context-menu.module.css";

type Naming = { "aria-label": string } | { "aria-labelledby": string };

export type ContentProps = Omit<ComponentProps<"div">, "id" | "role" | "popover"> & Naming;

/** The menu, opened at the pointer and kept inside the window. */
export function Content(props: ContentProps) {
  const menu = useMenu();

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
