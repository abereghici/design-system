"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

/** `cancel()`: keeps the rows that were selected. */
export type ChangeEventDetails = Details<"row-press" | "select-all-press">;

/** The keys of the selected rows: each one a `Row`'s `id`. */
export type SelectionKeys = ReadonlySet<string>;

interface TableState {
  readonly selectionMode: "single" | "multiple" | undefined;
  readonly keys: SelectionKeys;
  readonly name: string;
  readonly select: (
    keys: SelectionKeys,
    reason: ChangeEventDetails["reason"],
    event: Event,
  ) => boolean;
}

const TableContext = createContext<TableState | null>(null);

export function useTable(part: string) {
  const table = use(TableContext);

  if (table === null) throw new Error(`Table.${part} must be inside Table.Root`);

  return table;
}

const none: SelectionKeys = new Set();

export type RootProps = ComponentProps<"table"> & {
  /** `single` chooses one row at a time, `multiple` any number of them. */
  selectionMode?: "single" | "multiple";
  /** Called before the selection changes; `details.cancel()` keeps the current one. */
  onSelectionChange?: (keys: SelectionKeys, details: ChangeEventDetails) => void;
  /** Announces the Table as busy while its rows load; show `Skeleton` rows meanwhile. */
  loading?: boolean;
  /** Keeps the Header in view while the rows scroll inside the box around the Table. */
  stickyHeader?: boolean;
} & (
    | { selectedKeys: SelectionKeys; defaultSelectedKeys?: never }
    | { defaultSelectedKeys?: SelectionKeys; selectedKeys?: never }
  );

/**
 * Rows and columns of data that people read and compare. Compose `Caption`, `Header`, `Body`,
 * `Row`, `ColumnHeader`, `RowHeader` and `Cell`; a Link or Button inside a cell is its own tab stop.
 * Sort with a `SortLabel` in a `ColumnHeader`, and select rows with `selectionMode` plus a
 * `SelectAll` and a `SelectRow` cell. Show `Skeleton` rows while `loading`, and an `Empty` row with
 * an EmptyState when there is no data. Put a wide or tall table in a ScrollArea, and page long data
 * with Pagination. For a short list of labelled values, use a description list.
 *
 * Tier 1: works before hydration, except row selection (Tier 2), which works after it.
 */
export function Root({
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  loading = false,
  stickyHeader = false,
  ...props
}: RootProps) {
  const name = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultSelectedKeys ?? none);
  const keys = selectedKeys ?? uncontrolled;

  function select(
    next: SelectionKeys,
    reason: ChangeEventDetails["reason"],
    event: Event,
  ): boolean {
    if (!requestChange(onSelectionChange, next, reason, event)) return false;

    setUncontrolled(next);

    return true;
  }

  return (
    <TableContext value={{ selectionMode, keys, name, select }}>
      <table
        {...mergeProps(
          {
            className: styles["root"],
            "aria-busy": loading || undefined,
            "data-sticky-header": stickyHeader ? "" : undefined,
          },
          props,
        )}
      />
    </TableContext>
  );
}
