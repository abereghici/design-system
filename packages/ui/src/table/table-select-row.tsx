"use client";

import { use } from "react";
import type { ChangeEvent, ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { Checkbox } from "../checkbox/checkbox.tsx";
import { dispatchFeedback } from "../events/events.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import { Cell } from "./table-cell.tsx";
import { useTable } from "./table-root.tsx";
import { RowContext } from "./table-row.tsx";
import styles from "./table.module.css";

/**
 * The cell that selects its row: a checkbox, or a radio in `single` mode, named by the row's
 * `RowHeader`.
 */
export function SelectRow(props: ComponentProps<"td">) {
  const table = useTable("SelectRow");
  const row = use(RowContext);

  if (row === null) throw new Error("Table.SelectRow must be inside Table.Row");

  const { id, headerId } = row;

  if (id === undefined) throw new Error("Table.SelectRow needs an id on its Table.Row");

  const selected = table.keys.has(id);
  const one = new Set([id]);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    if (table.select(one, "row-press", event.nativeEvent)) {
      dispatchFeedback(event.currentTarget, "ab-toggle", { component: "Table", reason: "user" });
    }
  }

  return (
    <Cell {...mergeProps({ className: styles["select"] }, props)}>
      {table.selectionMode === "single" ? (
        <label className={styles["choice"]}>
          <input
            type="radio"
            className={styles["radio"]}
            name={table.name}
            aria-labelledby={headerId}
            checked={selected}
            onChange={choose}
          />
        </label>
      ) : (
        <Checkbox
          aria-labelledby={headerId}
          checked={selected}
          onCheckedChange={(checked, details) => {
            const next = checked ? table.keys.union(one) : table.keys.difference(one);

            if (!table.select(next, "row-press", details.event)) details.cancel();
          }}
        />
      )}
    </Cell>
  );
}
