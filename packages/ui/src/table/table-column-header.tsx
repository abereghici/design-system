import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./table.module.css";

export interface ColumnHeaderProps extends ComponentProps<"th"> {
  /**
   * How the rows are sorted by this column, announced to screen readers. Set it on one column only.
   */
  sortDirection?: "ascending" | "descending" | undefined;
}

export function ColumnHeader({ sortDirection, ...props }: ColumnHeaderProps) {
  return (
    <th
      scope="col"
      aria-sort={sortDirection}
      {...mergeProps({ className: styles["column-header"] }, props)}
    />
  );
}
