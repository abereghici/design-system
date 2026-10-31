"use client";

import { createContext, useId } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import { useTable } from "./table-root.tsx";
import styles from "./table.module.css";

interface RowState {
  readonly id: string | undefined;
  readonly headerId: string;
}

export const RowContext = createContext<RowState | null>(null);

export interface RowProps extends Omit<ComponentProps<"tr">, "id"> {
  /** The row's key in `selectedKeys`; every selectable row needs one. */
  id?: string;
  /**
   * Highlights the row as chosen, for a Table that holds its own selection; with `selectionMode`
   * the chosen rows are highlighted already.
   */
  selected?: boolean;
}

/** One row of Cells. */
export function Row({ id, selected, ...props }: RowProps) {
  const table = useTable("Row");
  const headerId = useId();
  const chosen = selected ?? (id !== undefined && table.keys.has(id));

  return (
    <RowContext value={{ id, headerId }}>
      <tr
        {...mergeProps(
          { className: styles["row"], "data-selected": chosen ? "" : undefined },
          props,
        )}
      />
    </RowContext>
  );
}
