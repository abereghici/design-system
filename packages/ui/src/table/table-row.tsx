import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

export interface RowProps extends ComponentProps<"tr"> {
  /**
   * Highlights the row as chosen. Pair it with a checked Checkbox in the row, which screen readers
   * announce.
   */
  selected?: boolean;
}

/** One row of Cells. */
export function Row({ selected = false, ...props }: RowProps) {
  return (
    <tr
      {...mergeProps({ className: styles["row"] }, props)}
      data-selected={selected ? "" : undefined}
    />
  );
}
