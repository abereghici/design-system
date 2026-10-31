"use client";

import { useState } from "react";
import type { ComponentProps, KeyboardEvent, SyntheticEvent } from "react";

import "@abereghici/tokens/components/tree.css";

import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";
import { pointerMarker } from "../internal/interaction/pointer-marker.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { treeNavigation } from "./tree-navigation.ts";
import { useTreeState } from "./use-tree-state.ts";
import styles from "./tree.module.css";

/**
 * `"arrow-key"`: Right or Left on an Item. `"item-press"`: a click on an Item's chevron, or a
 * click, Enter or Space on an Item without a `selectionMode`. `cancel()`: keeps the Items
 * as they were.
 */
export type ExpandedChangeEventDetails = Details<"arrow-key" | "item-press">;

/** `"item-press"`: a click, Enter or Space on an Item. `cancel()`: keeps the selection. */
export type SelectionChangeEventDetails = Details<"item-press">;

export interface TreeItemState {
  readonly id: string;
  readonly branch: boolean;
  readonly expanded: boolean;
}

type ItemEvent = SyntheticEvent<HTMLElement>;

interface TreeContextValue {
  readonly state: {
    readonly expandedKeys: ReadonlySet<string>;
    readonly selectedKeys: ReadonlySet<string> | null;
    readonly active: string | null;
  };
  /** `keyDown` and `press` answer whether the Tree accepted a change. */
  readonly actions: {
    readonly focus: (id: string) => void;
    readonly keyDown: (event: KeyboardEvent<HTMLElement>, item: TreeItemState) => boolean;
    readonly press: (event: ItemEvent, item: TreeItemState) => boolean;
  };
  readonly meta: { readonly level: number };
}

export const [TreeContext, useTree] = createSafeContext<TreeContextValue>("Tree.Root");

/** Whether a click landed on the chevron, the Item's first child, rather than its label. */
const onChevron = (event: ItemEvent, item: TreeItemState) =>
  item.branch &&
  event.target instanceof Node &&
  event.currentTarget.firstElementChild?.contains(event.target) === true;

type TreeState = ReturnType<typeof useTreeState>;

function press(tree: TreeState, event: ItemEvent, item: TreeItemState) {
  if (tree.selectedKeys === null || onChevron(event, item)) {
    return item.branch && tree.toggle(item.id, "item-press", event.nativeEvent);
  }

  return tree.select(item.id, event.nativeEvent);
}

function keyDown(tree: TreeState, event: KeyboardEvent<HTMLElement>, item: TreeItemState) {
  const target = treeNavigation.keyTarget(event, item);

  if (target === null) return false;

  event.preventDefault();

  if (target === "toggle") return tree.toggle(item.id, "arrow-key", event.nativeEvent);

  if (target === "press") return press(tree, event, item);

  if (target instanceof HTMLElement) target.focus();

  return false;
}

const own = {
  className: styles["root"],
  onFocus: treeNavigation.focusSelectedItem,
  ...pointerMarker,
};

export type RootProps = Omit<ComponentProps<"div">, "role" | "aria-label" | "aria-labelledby"> & {
  /** The `id`s of the expanded Items, when your state holds them. */
  expandedKeys?: ReadonlyArray<string>;
  /** The Items expanded on the first render when it holds its own state. */
  defaultExpandedKeys?: ReadonlyArray<string>;
  /**
   * Called before an Item expands or collapses, with the `id`s that would be expanded. Render an
   * Item's children once it expands to load them lazily.
   */
  onExpandedChange?: (keys: string[], details: ExpandedChangeEventDetails) => void;
  /** Lets people select one Item or several; without it, Items only expand and collapse. */
  selectionMode?: "single" | "multiple" | undefined;
  /** The `id`s of the selected Items, when your state holds them. */
  selectedKeys?: ReadonlyArray<string>;
  /** The Items selected on the first render when it holds its own state. */
  defaultSelectedKeys?: ReadonlyArray<string>;
  /** Called before the selection changes, with the `id`s that would be selected. */
  onSelectionChange?: (keys: string[], details: SelectionChangeEventDetails) => void;
} & AccessibleName &
  (
    | { expandedKeys: ReadonlyArray<string>; defaultExpandedKeys?: never }
    | { defaultExpandedKeys?: ReadonlyArray<string>; expandedKeys?: never }
  ) &
  (
    | { selectedKeys: ReadonlyArray<string>; defaultSelectedKeys?: never }
    | { defaultSelectedKeys?: ReadonlyArray<string>; selectedKeys?: never }
  );

/**
 * A hierarchy people expand and collapse, such as folders and files. It takes one Tab stop; Up and
 * Down move through the shown Items, Home and End reach the ends, Right expands an Item or enters
 * it, and Left collapses it or goes up to its parent (mirrored right to left). With a
 * `selectionMode`, Enter, Space or a click selects an Item and its chevron expands it. Every change
 * dispatches a bubbling `ab-toggle`. Name it with `aria-label` or `aria-labelledby`.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, the
 * chevrons are hidden.
 */
export function Root({
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  ...props
}: RootProps) {
  const tree = useTreeState({
    expandedKeys,
    defaultExpandedKeys,
    onExpandedChange,
    selectionMode,
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
  });
  const [active, setActive] = useState<string | null>(null);

  return (
    <TreeContext
      value={{
        state: { expandedKeys: tree.expandedKeys, selectedKeys: tree.selectedKeys, active },
        actions: {
          focus: setActive,
          keyDown: (event, item) => keyDown(tree, event, item),
          press: (event, item) => press(tree, event, item),
        },
        meta: { level: 1 },
      }}
    >
      <div
        {...mergeProps(own, props)}
        role="tree"
        aria-multiselectable={selectionMode === "multiple" ? true : undefined}
        tabIndex={active === null ? 0 : -1}
      />
    </TreeContext>
  );
}
