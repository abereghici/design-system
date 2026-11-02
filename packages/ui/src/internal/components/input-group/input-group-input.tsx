import type { ComponentProps } from "react";

import { mergeProps } from "../../utils/merge-props.ts";

import styles from "./input-group.module.css";

/** The input inside an InputGroup: the group draws the box, so it draws none of its own. */
export function InputGroupInput(props: ComponentProps<"input">) {
  return <input dir="auto" {...mergeProps({ className: styles["input"] }, props)} />;
}
