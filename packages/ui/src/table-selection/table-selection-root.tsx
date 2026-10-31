"use client";

import { createContext, use, useId } from "react";
import type { ReactNode } from "react";

import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useControllableState } from "../events/use-controllable-state.ts";

/** `cancel()`: keeps the rows that were selected. */
export type ChangeEventDetails = Details<"row-press" | "select-all-press">;

interface SelectionContext {
  readonly state: {
    readonly selectionMode: "single" | "multiple";
    readonly selectedKeys: ReadonlyArray<string>;
  };
  readonly actions: {
    /** Requests the change; `false` when the app cancelled it. */
    readonly select: (
      keys: string[],
      reason: ChangeEventDetails["reason"],
      event: Event,
    ) => boolean;
  };
  readonly meta: { readonly name: string };
}

const Context = createContext<SelectionContext | null>(null);

export function useSelection(part: string) {
  const selection = use(Context);

  if (selection === null)
    throw new Error(`TableSelection.${part} must be inside TableSelection.Root`);

  return selection;
}

export type RootProps = {
  /** `single` chooses one row at a time, `multiple` any number of them. */
  selectionMode: "single" | "multiple";
  /** Called before the selection changes; `details.cancel()` keeps the current one. */
  onSelectionChange?: ((keys: string[], details: ChangeEventDetails) => void) | undefined;
  /** The Table whose rows it selects, and anything else that shows or acts on the selection. */
  children: ReactNode;
} & (
  | {
      /** The selected rows' keys, when your state holds them. */
      selectedKeys: ReadonlyArray<string>;
      defaultSelectedKeys?: never;
    }
  | {
      selectedKeys?: never;
      /** The rows selected on the first render when it holds its own state. */
      defaultSelectedKeys?: ReadonlyArray<string> | undefined;
    }
);

/**
 * Selects rows of the Table inside it: put a `SelectRow` cell first in each selectable Table `Row`
 * and, with `selectionMode="multiple"`, a `SelectAll` header cell, which selects them all. Each
 * change is a request your `onSelectionChange` can cancel. A Table without it ships no script.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, the
 * selection column is hidden.
 */
export function Root({
  selectionMode,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  children,
}: RootProps) {
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
        actions: { select },
        meta: { name },
      }}
    >
      {children}
    </Context>
  );
}
