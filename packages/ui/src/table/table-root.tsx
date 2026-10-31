import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

export interface RootProps extends ComponentProps<"table"> {
  /** Announces the Table as busy while its rows load; show `Skeleton` rows meanwhile. */
  loading?: boolean;
}

/**
 * Rows and columns of data that people read and compare. Compose `Caption`, `Header`, `Body`,
 * `Row`, `ColumnHeader`, `RowHeader` and `Cell`; a Link or Button inside a cell is its own tab stop.
 * The Header stays in view while the rows scroll inside the box around the Table. Sort with a
 * `SortLabel` in a `ColumnHeader`, and select rows with a TableSelection around it. Show `Skeleton`
 * rows while `loading`, and an `Empty` row with an EmptyState when there is no data. Put a wide or
 * tall table in a ScrollArea, and page long data with Pagination. For a short list of labelled
 * values, use a DescriptionList.
 *
 * Tier 1: works before hydration.
 */
export function Root({ loading = false, ...props }: RootProps) {
  return (
    <table
      {...mergeProps({ className: styles["root"], "aria-busy": loading || undefined }, props)}
    />
  );
}
