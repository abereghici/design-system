import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./action-list.module.css";

export type TrailingVisualProps = ComponentProps<"span">;

/** Content after the row's name, such as an arrow for a link that leaves the site. */
export function TrailingVisual(props: TrailingVisualProps) {
  return <span {...mergeProps({ className: styles["trailing-visual"] }, props)} />;
}
