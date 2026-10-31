"use client";

import { createContext, use, useState } from "react";
import type { ComponentProps, FocusEvent, KeyboardEvent, SyntheticEvent } from "react";

import "@abereghici/tokens/components/tree.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { pointerMarker } from "../internal/interaction/pointer-marker.ts";
import { typeahead } from "../internal/listbox/typeahead.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { toggled } from "../internal/selection/selection.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

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
  readonly actions: {
    readonly focus: (id: string) => void;
    readonly keyDown: (event: KeyboardEvent<HTMLElement>, item: TreeItemState) => void;
    readonly press: (event: ItemEvent, item: TreeItemState) => void;
  };
  readonly meta: { readonly level: number };
}

export const TreeContext = createContext<TreeContextValue | null>(null);

export function useTree(part: string) {
  const tree = use(TreeContext);

  if (tree === null) throw new Error(`Tree.${part} must be inside Tree.Root`);

  return tree;
}

const shownItems = (tree: Element) => [...tree.querySelectorAll<HTMLElement>('[role="treeitem"]')];

/** Whether a click landed on the chevron, the Item's first child, rather than its label. */
const onChevron = (event: ItemEvent, item: TreeItemState) =>
  item.branch &&
  event.target instanceof Node &&
  event.currentTarget.firstElementChild?.contains(event.target) === true;

/** Hands the Tree's Tab stop to its selected Item, or its first. */
function enter(event: FocusEvent<HTMLElement>) {
  if (event.target !== event.currentTarget) return;

  const items = shownItems(event.currentTarget);

  (items.find((item) => item.getAttribute("aria-selected") === "true") ?? items[0])?.focus();
}

/**
 * What a key does on an Item: the Item to focus, `"toggle"` or `"press"` the Item, `undefined` for
 * a key with nothing to reach, or `null` for a key the Tree leaves alone.
 */
function keyTarget(event: KeyboardEvent<HTMLElement>, item: TreeItemState) {
  const tree = event.currentTarget.closest('[role="tree"]');

  if (tree === null) return null;

  const items = shownItems(tree);
  const index = items.indexOf(event.currentTarget);
  const rtl = event.currentTarget.matches(":dir(rtl)");
  const group = event.currentTarget.parentElement;
  const parent = group instanceof HTMLFieldSetElement ? group.previousElementSibling : undefined;
  const targets: Record<string, Element | "toggle" | "press" | null | undefined> = {
    ArrowDown: items[index + 1],
    ArrowUp: items[index - 1],
    Home: items[0],
    End: items.at(-1),
    [rtl ? "ArrowLeft" : "ArrowRight"]: item.expanded
      ? items[index + 1]
      : item.branch
        ? "toggle"
        : undefined,
    [rtl ? "ArrowRight" : "ArrowLeft"]: item.expanded ? "toggle" : parent,
    Enter: "press",
    " ": "press",
  };

  if (event.key in targets) return targets[event.key];

  if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return null;

  return typeahead(tree, event.key, items, event.currentTarget) ?? null;
}

/** Keys held by the Tree or the app; a change is requested first and dispatches `ab-toggle`. */
function useKeys<Reason extends string>(
  keys: ReadonlyArray<string> | undefined,
  defaultKeys: ReadonlyArray<string>,
  onChange: ((keys: string[], details: Details<Reason>) => void) | undefined,
) {
  const [current, request] = useControllableState(keys, defaultKeys, onChange);

  function change(next: string[], reason: Reason, event: ItemEvent) {
    if (request(next, reason, event.nativeEvent)) {
      dispatchFeedback(event.currentTarget, "ab-toggle", {
        component: "Tree",
        userInitiated: true,
      });
    }
  }

  return [current, change] as const;
}

export type RootProps = Omit<ComponentProps<"div">, "role"> & {
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
} & ({ "aria-label": string } | { "aria-labelledby": string }) &
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
  defaultExpandedKeys = [],
  onExpandedChange,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  ...props
}: RootProps) {
  const [expanded, setExpanded] = useKeys(expandedKeys, defaultExpandedKeys, onExpandedChange);
  const [selected, setSelected] = useKeys(selectedKeys, defaultSelectedKeys, onSelectionChange);
  const [active, setActive] = useState<string | null>(null);
  const expandedSet = new Set(expanded);
  const selectedSet = selectionMode === undefined ? null : new Set(selected);

  function press(event: ItemEvent, item: TreeItemState) {
    if (selectedSet === null || onChevron(event, item)) {
      if (item.branch) setExpanded(toggled(expanded, item.id), "item-press", event);
    } else if (selectionMode === "multiple") {
      setSelected(toggled(selected, item.id), "item-press", event);
    } else if (!selectedSet.has(item.id)) {
      setSelected([item.id], "item-press", event);
    }
  }

  function keyDown(event: KeyboardEvent<HTMLElement>, item: TreeItemState) {
    const target = keyTarget(event, item);

    if (target === null) return;

    event.preventDefault();

    if (target === "toggle") setExpanded(toggled(expanded, item.id), "arrow-key", event);
    else if (target === "press") press(event, item);
    else if (target instanceof HTMLElement) target.focus();
  }

  return (
    <TreeContext
      value={{
        state: { expandedKeys: expandedSet, selectedKeys: selectedSet, active },
        actions: { focus: setActive, keyDown, press },
        meta: { level: 1 },
      }}
    >
      <div
        {...mergeProps({ className: styles["root"], onFocus: enter, ...pointerMarker }, props)}
        role="tree"
        aria-multiselectable={selectionMode === "multiple" ? true : undefined}
        tabIndex={active === null ? 0 : -1}
      />
    </TreeContext>
  );
}
