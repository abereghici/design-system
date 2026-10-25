import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./table.module.css";

/**
 * The button inside a sortable ColumnHeader: its text names the column, and an arrow shows the
 * sort. Your `onClick` reorders the rows.
 */
export function SortLabel({ className, ...props }: ComponentProps<"button">) {
  return <button {...props} type="button" className={join(styles["sort-label"], className)} />;
}
