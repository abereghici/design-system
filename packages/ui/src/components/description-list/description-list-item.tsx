import "@abereghici/tokens/components/description-list.css";

import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./description-list.module.css";

export type ItemProps = ComponentProps<"div">;

/** One term and its value, kept together. */
export function Item(props: ItemProps) {
  return <div {...mergeProps({ className: styles["item"] }, props)} />;
}
