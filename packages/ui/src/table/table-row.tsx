import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./table.module.css";

/** One row of Cells. */
export function Row(props: ComponentProps<"tr">) {
  return <tr {...mergeProps({ className: styles["row"] }, props)} />;
}
