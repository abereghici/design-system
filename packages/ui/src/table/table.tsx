import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./table.module.css";

/**
 * Rows and columns of data that people read and compare. Compose `Caption`, `Header`, `Body`, `Row`,
 * `ColumnHeader`, `RowHeader` and `Cell`; a Link or Button inside a cell is its own tab stop. Sort
 * with a `SortLabel` in a `ColumnHeader`; select rows with a column of Checkboxes and `Row`'s
 * `selected`. Put a wide table inside a ScrollArea. For a short list of labelled values, use a
 * description list.
 */
export function Root({ className, ...props }: ComponentProps<"table">) {
  return <table {...props} className={join(styles["root"], className)} />;
}

export function Caption({ className, ...props }: ComponentProps<"caption">) {
  return <caption {...props} className={join(styles["caption"], className)} />;
}

export function Header(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}

export function Body({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody {...props} className={join(styles["body"], className)} />;
}

export interface RowProps extends ComponentProps<"tr"> {
  /**
   * Highlights the row as chosen. Pair it with a checked Checkbox in the row, which screen readers
   * announce.
   */
  selected?: boolean;
}

export function Row({ selected = false, className, ...props }: RowProps) {
  return (
    <tr
      {...props}
      data-selected={selected || undefined}
      className={join(styles["row"], className)}
    />
  );
}

export interface ColumnHeaderProps extends ComponentProps<"th"> {
  /**
   * How the rows are sorted by this column, announced to screen readers. Set it on one column only.
   */
  sortDirection?: "ascending" | "descending" | undefined;
}

export function ColumnHeader({ sortDirection, className, ...props }: ColumnHeaderProps) {
  return (
    <th
      scope="col"
      aria-sort={sortDirection}
      {...props}
      className={join(styles["column-header"], className)}
    />
  );
}

/**
 * The button inside a sortable ColumnHeader: its text names the column, and an arrow shows the
 * sort. Your `onClick` reorders the rows.
 */
export function SortLabel({ className, ...props }: ComponentProps<"button">) {
  return <button {...props} type="button" className={join(styles["sort-label"], className)} />;
}

export function RowHeader({ className, ...props }: ComponentProps<"th">) {
  return <th scope="row" {...props} className={join(styles["cell"], className)} />;
}

export function Cell({ className, ...props }: ComponentProps<"td">) {
  return <td {...props} className={join(styles["cell"], className)} />;
}
