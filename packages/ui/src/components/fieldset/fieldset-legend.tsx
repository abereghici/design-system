import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./fieldset.module.css";

/** Names the group of fields. */
export function Legend(props: ComponentProps<"legend">) {
  return <legend {...mergeProps({ className: styles["legend"] }, props)} />;
}
