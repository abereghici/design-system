import { toggled } from "../internal/selection/selection.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import type { RootProps } from "./tree-root.tsx";

type Options = {
  readonly [
    Key in
      | "expandedKeys"
      | "defaultExpandedKeys"
      | "onExpandedChange"
      | "selectionMode"
      | "selectedKeys"
      | "defaultSelectedKeys"
      | "onSelectionChange"
  ]: RootProps[Key];
};

/**
 * The Tree's expanded Items and, with a `selectionMode`, its selected ones, held by the Tree or the
 * app. Each change is requested first; `toggle` and `select` answer whether it was accepted.
 */
export function useTreeState(options: Options) {
  const { selectionMode } = options;
  const [expanded, requestExpanded] = useControllableState(
    options.expandedKeys,
    options.defaultExpandedKeys ?? [],
    options.onExpandedChange,
  );
  const [selected, requestSelected] = useControllableState(
    options.selectedKeys,
    options.defaultSelectedKeys ?? [],
    options.onSelectionChange,
  );
  const selectedKeys = selectionMode === undefined ? null : new Set(selected);

  return {
    expandedKeys: new Set(expanded),
    selectedKeys,
    toggle: (id: string, reason: "arrow-key" | "item-press", event: Event) =>
      requestExpanded(toggled(expanded, id), reason, event),
    select: (id: string, event: Event) => {
      if (selectionMode === "multiple") {
        return requestSelected(toggled(selected, id), "item-press", event);
      }

      return selectedKeys?.has(id) === false && requestSelected([id], "item-press", event);
    },
  };
}
