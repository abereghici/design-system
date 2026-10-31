import type { ComponentProps } from "react";

import "@abereghici/tokens/components/field.css";
import "@abereghici/tokens/components/select.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./select.module.css";

export interface GroupProps extends ComponentProps<"optgroup"> {
  /** The heading of its options, read before them. */
  label: string;
}

/** A set of options under a `label`. */
export function Group(props: GroupProps) {
  return <optgroup {...mergeProps({ className: styles["group"] }, props)} />;
}
