"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/tabs.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./tabs.module.css";

export type ListProps = ComponentProps<"div"> &
  ({ "aria-label": string } | { "aria-labelledby": string });

/** The row of Triggers; name it with `aria-label` or `aria-labelledby`. */
export function List(props: ListProps) {
  return <div {...mergeProps({ className: styles["list"] }, props)} role="tablist" />;
}
