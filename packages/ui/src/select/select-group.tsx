import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./select.module.css";

export interface GroupProps extends ComponentProps<"optgroup"> {
  /** The heading of its options, read before them. */
  label: string;
}

/** A set of options under a `label`. */
export function Group(props: GroupProps) {
  return <optgroup {...mergeProps({ className: styles["group"] }, props)} />;
}
