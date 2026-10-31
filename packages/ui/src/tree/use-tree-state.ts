import type { SyntheticEvent } from "react";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { toggled } from "../internal/selection/selection.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import type { RootProps } from "./tree-root.tsx";

type ItemEvent = SyntheticEvent<HTMLElement>;

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

/** Keys held by the Tree or the app; a change is requested first and dispatches `ab-toggle`. */
function useKeys<Reason extends string>(
  keys: ReadonlyArray<string> | undefined,
  defaultKeys: ReadonlyArray<string> | undefined,
  onChange: ((keys: string[], details: Details<Reason>) => void) | undefined,
) {
  const [current, request] = useControllableState(keys, defaultKeys ?? [], onChange);

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

/** The Tree's expanded Items and, with a `selectionMode`, its selected ones. */
export function useTreeState(options: Options) {
  const { selectionMode } = options;
  const [expanded, setExpanded] = useKeys(
    options.expandedKeys,
    options.defaultExpandedKeys,
    options.onExpandedChange,
  );
  const [selected, setSelected] = useKeys(
    options.selectedKeys,
    options.defaultSelectedKeys,
    options.onSelectionChange,
  );
  const selectedKeys = selectionMode === undefined ? null : new Set(selected);

  return {
    expandedKeys: new Set(expanded),
    selectedKeys,
    toggle: (id: string, reason: "arrow-key" | "item-press", event: ItemEvent) => {
      setExpanded(toggled(expanded, id), reason, event);
    },
    select: (id: string, event: ItemEvent) => {
      if (selectionMode === "multiple") setSelected(toggled(selected, id), "item-press", event);
      else if (selectedKeys?.has(id) === false) setSelected([id], "item-press", event);
    },
  };
}
