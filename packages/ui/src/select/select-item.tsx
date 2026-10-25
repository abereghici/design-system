import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./select.module.css";

export interface ItemProps extends ComponentProps<"option"> {
  /** What the form submits and `onValueChange` reports when this option is chosen. */
  value: string;
}

/** One option: its text, optionally after a decorative icon that not every browser shows. */
export function Item(props: ItemProps) {
  return <option {...mergeProps({ className: styles["item"] }, props)} />;
}
