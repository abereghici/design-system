"use client";

import "@abereghici/tokens/components/tabs.css";

import type { ComponentProps } from "react";

import { pointerMarker } from "../../internal/interactions/pointer-marker.ts";
import type { AccessibleName } from "../../internal/types/accessible-name.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./tabs.module.css";

export type ListProps = Omit<ComponentProps<"div">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/** The row of Triggers; name it with `aria-label` or `aria-labelledby`. */
export function List(props: ListProps) {
  return (
    <div {...mergeProps({ className: styles["list"], ...pointerMarker }, props)} role="tablist" />
  );
}
