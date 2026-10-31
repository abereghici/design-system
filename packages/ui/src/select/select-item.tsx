import type { ComponentProps } from "react";

import "@abereghici/tokens/components/field.css";
import "@abereghici/tokens/components/select.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./select.module.css";

export interface ItemProps extends ComponentProps<"option"> {
  /** What the form submits and `onValueChange` reports when this option is chosen. */
  value: string;
}

/** One option: its text, optionally after a decorative icon that not every browser shows. */
export function Item(props: ItemProps) {
  return <option {...mergeProps({ className: styles["item"] }, props)} />;
}
