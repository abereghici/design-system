import "@abereghici/tokens/components/table.css";

import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./table.module.css";

/** The row of ColumnHeaders. */
export function Header(props: ComponentProps<"thead">) {
  return <thead {...mergeProps({ className: styles["header"] }, props)} />;
}
