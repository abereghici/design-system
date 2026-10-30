import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

/**
 * The button inside a sortable ColumnHeader: its text names the column, and an arrow shows the
 * sort. Your `onClick` reorders the rows.
 */
export function SortLabel(props: ComponentProps<"button">) {
  return <button {...mergeProps({ className: styles["sort-label"] }, props)} type="button" />;
}
