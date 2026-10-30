import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

/**
 * Rows and columns of data that people read and compare. Compose `Caption`, `Header`, `Body`, `Row`,
 * `ColumnHeader`, `RowHeader` and `Cell`; a Link or Button inside a cell is its own tab stop. Sort
 * with a `SortLabel` in a `ColumnHeader`; select rows with a column of Checkboxes and `Row`'s
 * `selected`. Put a wide table inside a ScrollArea. For a short list of labelled values, use a
 * description list.
 *
 * Tier 1: works before hydration.
 */
export function Root(props: ComponentProps<"table">) {
  return <table {...mergeProps({ className: styles["root"] }, props)} />;
}
