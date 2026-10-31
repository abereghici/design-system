"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { Checkbox } from "../checkbox/checkbox.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

import { ColumnHeader } from "./table-column-header.tsx";
import { useTable } from "./table-root.tsx";
import styles from "./table.module.css";

export interface SelectAllProps extends ComponentProps<"th"> {
  /** The `id` of every row the checkbox selects, usually the rows on the page. */
  keys: readonly string[];
  /** Names the checkbox, such as "Select all invoices". */
  selectAllLabel: string;
}

/**
 * The header cell of the selection column: a checkbox that selects every row in `keys`, and reports
 * mixed while only some of them are selected. Needs `selectionMode="multiple"`.
 */
export function SelectAll({ keys, selectAllLabel, ...props }: SelectAllProps) {
  const table = useTable("SelectAll");

  if (table.selectionMode !== "multiple") {
    throw new Error('Table.SelectAll needs selectionMode="multiple" on Table.Root');
  }

  const selected = keys.filter((key) => table.keys.has(key)).length;
  const all = keys.length > 0 && selected === keys.length;

  return (
    <ColumnHeader {...mergeProps({ className: styles["select"] }, props)}>
      <Checkbox
        aria-label={selectAllLabel}
        checked={all}
        indeterminate={selected > 0 && !all}
        onCheckedChange={(checked, details) => {
          const page = new Set(keys);
          const next = checked ? table.keys.union(page) : table.keys.difference(page);

          if (!table.select(next, "select-all-press", details.event)) details.cancel();
        }}
      />
    </ColumnHeader>
  );
}
