"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/tabs.css";

import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import { pointerMarker } from "../internal/interaction/pointer-marker.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./tabs.module.css";

export type ListProps = Omit<ComponentProps<"div">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/** The row of Triggers; name it with `aria-label` or `aria-labelledby`. */
export function List(props: ListProps) {
  return (
    <div {...mergeProps({ className: styles["list"], ...pointerMarker }, props)} role="tablist" />
  );
}
