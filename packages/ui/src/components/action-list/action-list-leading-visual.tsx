import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./action-list.module.css";

export type LeadingVisualProps = ComponentProps<"span">;

/** An icon or picture before the row's name. */
export function LeadingVisual(props: LeadingVisualProps) {
  return <span {...mergeProps({ className: styles["leading-visual"] }, props)} />;
}
