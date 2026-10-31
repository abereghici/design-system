import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import { Selection } from "./table-selection.tsx";
import type { ChangeEventDetails } from "./table-selection.tsx";
import styles from "./table.module.css";

export type RootProps = ComponentProps<"table"> & {
  /** Announces the Table as busy while its rows load; show `Skeleton` rows meanwhile. */
  loading?: boolean;
  /** Lets people select rows: `single` one at a time, `multiple` any number of them. */
  selectionMode?: "single" | "multiple" | undefined;
  /** Called before the selection changes; `details.cancel()` keeps the current one. */
  onSelectionChange?: ((keys: string[], details: ChangeEventDetails) => void) | undefined;
} & (
    | {
        /** The selected rows' keys, when your state holds them. */
        selectedKeys: ReadonlyArray<string>;
        defaultSelectedKeys?: never;
      }
    | {
        selectedKeys?: never;
        /** The rows selected on the first render when the Table holds its own state. */
        defaultSelectedKeys?: ReadonlyArray<string> | undefined;
      }
  );

/**
 * Rows and columns of data that people read and compare. Compose `Caption`, `Header`, `Body`,
 * `Row`, `ColumnHeader`, `RowHeader` and `Cell`; a Link or Button inside a cell is its own tab stop.
 * The Header stays in view while the rows scroll inside the box around the Table. Sort with a
 * `SortLabel` in a `ColumnHeader`. Select rows with a `selectionMode`, a `SelectRow` cell first in
 * each Row and, for `multiple`, a `SelectAll` header cell; each change is a request your
 * `onSelectionChange` can cancel. Show `Skeleton` rows while `loading`, and an `Empty` row with an
 * EmptyState when there is no data. Put a wide or tall table in a ScrollArea, and page long data
 * with Pagination. For a short list of labelled values, use a DescriptionList.
 *
 * Tier 1: works before hydration. Row selection is Tier 2: it shows from the server HTML and works
 * after hydration; with JavaScript off, the selection column is hidden.
 */
export function Root({
  loading = false,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  ...props
}: RootProps) {
  const table = (
    <table
      {...mergeProps({ className: styles["root"], "aria-busy": loading || undefined }, props)}
    />
  );

  if (selectionMode === undefined) return table;

  return (
    <Selection
      selectionMode={selectionMode}
      selectedKeys={selectedKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      onSelectionChange={onSelectionChange}
    >
      {table}
    </Selection>
  );
}
