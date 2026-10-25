"use client";

import type { ComponentProps } from "react";

import { menuContentProps } from "../menu/menu.tsx";
import { mergeProps } from "../slot/slot.tsx";

import { useDropdownMenu } from "./dropdown-menu-root.tsx";
import menuStyles from "../menu/menu.module.css";
import styles from "./dropdown-menu.module.css";

export interface ContentProps extends Omit<ComponentProps<"div">, "id" | "role" | "popover"> {
  /** The side it prefers; it moves to the other one when there is no room. */
  side?: "top" | "bottom";
  /** Lines the menu up with the Trigger's start or end edge, following the reading direction. */
  align?: "start" | "end";
}

/** The menu, named by its Trigger and at least as wide as it. */
export function Content({ side = "bottom", align = "start", ...props }: ContentProps) {
  const menu = useDropdownMenu();
  return (
    <div
      {...mergeProps({ className: `${menuStyles["content"]} ${styles["content"]}` }, props)}
      {...menuContentProps(menu)}
      aria-labelledby={`${menu.floating.contentId}-trigger`}
      data-side={side}
      data-align={align}
    />
  );
}
