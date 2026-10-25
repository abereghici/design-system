"use client";

import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./tabs.module.css";

export type ListProps = ComponentProps<"div"> &
  ({ "aria-label": string } | { "aria-labelledby": string });

export function List({ className, ...props }: ListProps) {
  return <div {...props} role="tablist" className={join(styles["list"], className)} />;
}
