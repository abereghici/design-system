"use client";

import { useId } from "react";
import type { ReactNode } from "react";

import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

/** `cancel()`: keeps the rows that were selected. */
export type ChangeEventDetails = Details<"row-press" | "select-all-press">;

interface SelectionProps {
  readonly selectionMode: "single" | "multiple";
  readonly selectedKeys: ReadonlyArray<string> | undefined;
  readonly defaultSelectedKeys: ReadonlyArray<string> | undefined;
  readonly onSelectionChange: ((keys: string[], details: ChangeEventDetails) => void) | undefined;
  readonly children: ReactNode;
}

interface SelectionContextValue {
  readonly state: {
    readonly selectionMode: "single" | "multiple";
    readonly selectedKeys: ReadonlyArray<string>;
  };
  readonly actions: {
    /** Requests the row chosen (`single`) or toggled (`multiple`); `false` when the app cancelled it. */
    readonly selectRow: (key: string, event: Event) => boolean;
    /** Requests every row in `keys` selected, or none of them; `false` when the app cancelled it. */
    readonly selectAll: (keys: ReadonlyArray<string>, selected: boolean, event: Event) => boolean;
  };
  readonly meta: { readonly name: string };
}

export const [SelectionContext, useSelection] = createSafeContext<SelectionContextValue>(
  "a Table.Root with a selectionMode",
);

/** Holds the selected rows of a Table.Root that has a `selectionMode`. */
export function Selection({
  selectionMode,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  children,
}: SelectionProps) {
  const name = useId();
  const [current, select] = useControllableState(
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
  );

  return (
    <SelectionContext
      value={{
        state: { selectionMode, selectedKeys: current },
        actions: {
          selectRow: (key, event) =>
            select(
              selectionMode === "single"
                ? [key]
                : [...new Set(current).symmetricDifference(new Set([key]))],
              "row-press",
              event,
            ),
          selectAll: (keys, selected, event) => {
            const others = current.filter((key) => !keys.includes(key));

            return select(selected ? [...others, ...keys] : others, "select-all-press", event);
          },
        },
        meta: { name },
      }}
    >
      {children}
    </SelectionContext>
  );
}
