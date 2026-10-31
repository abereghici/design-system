"use client";

import type { ChangeEvent, ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { Checkbox } from "../checkbox/checkbox.tsx";
import { dispatchFeedback } from "../events/events.ts";
import { mergeProps } from "../internal/slot/slot.tsx";
import { Cell } from "../table/table-cell.tsx";

import { useSelection } from "./table-selection-root.tsx";
import styles from "../table/table.module.css";

export interface SelectRowProps extends ComponentProps<"td"> {
  /** The row's key in `selectedKeys`. */
  value: string;
  /** Names the checkbox, or the radio in `single` mode, such as "Select INV-001". */
  selectRowLabel: string;
}

/** The cell that selects its Table row: a checkbox, or a radio in `single` mode. */
export function SelectRow({ value, selectRowLabel, ...props }: SelectRowProps) {
  const { state, actions, meta } = useSelection("SelectRow");
  const selected = state.selectedKeys.includes(value);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    if (actions.select([value], "row-press", event.nativeEvent)) {
      dispatchFeedback(event.currentTarget, "ab-toggle", {
        component: "TableSelection",
        reason: "user",
      });
    }
  }

  return (
    <Cell {...mergeProps({ className: styles["select"] }, props)}>
      {state.selectionMode === "single" ? (
        <label className={styles["choice"]}>
          <input
            type="radio"
            className={styles["radio"]}
            name={meta.name}
            aria-label={selectRowLabel}
            checked={selected}
            onChange={choose}
          />
        </label>
      ) : (
        <Checkbox
          aria-label={selectRowLabel}
          checked={selected}
          onCheckedChange={(checked, details) => {
            const next = checked
              ? [...state.selectedKeys, value]
              : state.selectedKeys.filter((key) => key !== value);

            if (!actions.select(next, "row-press", details.event)) details.cancel();
          }}
        />
      )}
    </Cell>
  );
}
