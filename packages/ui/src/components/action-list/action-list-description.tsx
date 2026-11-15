import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./action-list.module.css";

export type DescriptionProps = ComponentProps<"span">;

/** A second line under the row's name, read as the link's description. */
export function Description(props: DescriptionProps) {
  return <span {...mergeProps({ className: styles["description"] }, props)} />;
}
