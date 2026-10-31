import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./table.module.css";

/** The cell that names its row, such as an ID. */
export function RowHeader(props: ComponentProps<"th">) {
  return <th scope="row" {...mergeProps({ className: styles["cell"] }, props)} />;
}
