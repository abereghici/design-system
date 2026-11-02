"use client";

import type { ComponentProps, KeyboardEvent } from "react";

import { mergeProps } from "../../utils/merge-props.ts";

import { menuNavigation } from "./menu-navigation.ts";
import type { Menu } from "./menu.tsx";
import styles from "./menu.module.css";

/**
 * The menu's panel: its keyboard, pointer highlight and initial focus; DropdownMenu and ContextMenu
 * add placement.
 */
export function MenuContent({ menu, ...props }: ComponentProps<"div"> & { menu: Menu }) {
  const { onToggle, ...navigation } = menuNavigation;

  return (
    <div
      {...mergeProps(
        mergeProps(
          {
            className: styles["content"],
            ...menu.overlay.contentProps({ onToggle }),
            role: "menu",
            tabIndex: -1,
            ...navigation,
          } as const,
          {
            onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
              if (event.key !== "Tab") return;

              setTimeout(() => {
                menu.overlay.toggle(false, "focus-out", event.nativeEvent);
              });
            },
          },
        ),
        props,
      )}
    />
  );
}
