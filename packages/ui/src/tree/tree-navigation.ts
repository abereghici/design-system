import type { FocusEvent, KeyboardEvent } from "react";

import { typeahead } from "../internal/typeahead/typeahead.ts";

import type { TreeItemState } from "./tree-root.tsx";

const shownItems = (tree: Element) => [...tree.querySelectorAll<HTMLElement>('[role="treeitem"]')];

/** Where focus goes in a Tree: in from its Tab stop, and on from an Item by key. */
export const treeNavigation = {
  /** The Tree's own `focus` handler: hands its Tab stop to its selected Item, or its first. */
  focusSelectedItem: (event: FocusEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;

    const items = shownItems(event.currentTarget);

    (items.find((item) => item.getAttribute("aria-selected") === "true") ?? items[0])?.focus();
  },
  /**
   * What a key does on an Item: the Item to focus, `"toggle"` or `"press"` the Item, `undefined`
   * for a key with nothing to reach, or `null` for a key the Tree leaves alone.
   */
  keyTarget: (event: KeyboardEvent<HTMLElement>, item: TreeItemState) => {
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
  },
};
