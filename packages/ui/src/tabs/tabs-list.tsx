"use client";

import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./tabs.module.css";

export type ListProps = ComponentProps<"div"> &
  ({ "aria-label": string } | { "aria-labelledby": string });

export function List(props: ListProps) {
  return <div {...mergeProps({ className: styles["list"] }, props)} role="tablist" />;
}
