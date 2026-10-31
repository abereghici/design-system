import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { Slot, mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

export interface SortLabelProps extends ComponentProps<"button"> {
  /**
   * Gives the sort affordance to its one child, such as a link to the sorted page, which a server
   * sorts without waiting for JavaScript.
   */
  asChild?: boolean;
}

/**
 * The control inside a sortable ColumnHeader: its text names the column, and an arrow shows the
 * sort. Your `onClick` reorders the rows, or `asChild` wraps your own link.
 */
export function SortLabel({ asChild = false, ...props }: SortLabelProps) {
  if (asChild) return <Slot {...mergeProps({ className: styles["sort-label"] }, props)} />;

  return <button {...mergeProps({ className: styles["sort-label"] }, props)} type="button" />;
}
