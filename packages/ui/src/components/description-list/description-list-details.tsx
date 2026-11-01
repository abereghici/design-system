import "@abereghici/tokens/components/description-list.css";

import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./description-list.module.css";

export type DetailsProps = ComponentProps<"dd">;

/** The value of its Term. */
export function Details(props: DetailsProps) {
  return <dd {...mergeProps({ className: styles["details"] }, props)} />;
}
