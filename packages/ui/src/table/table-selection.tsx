"use client";

import { createContext, use, useId } from "react";
import type { ReactNode } from "react";

import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useControllableState } from "../events/use-controllable-state.ts";

/** `cancel()`: keeps the rows that were selected. */
export type ChangeEventDetails = Details<"row-press" | "select-all-press">;

interface SelectionProps {
  readonly selectionMode: "single" | "multiple";
  readonly selectedKeys: ReadonlyArray<string> | undefined;
  readonly defaultSelectedKeys: ReadonlyArray<string> | undefined;
  readonly onSelectionChange: ((keys: string[], details: ChangeEventDetails) => void) | undefined;
  readonly children: ReactNode;
}

interface SelectionContext {
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

const Context = createContext<SelectionContext | null>(null);

export function useSelection(part: string) {
  const selection = use(Context);

  if (selection === null) throw new Error(`Table.${part} needs a selectionMode on its Table.Root`);

  return selection;
}

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
    <Context
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
    </Context>
  );
}
