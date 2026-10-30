"use client";

import { useId } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent, ReactNode } from "react";

import "@abereghici/tokens/components/tree.css";

import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";
import { Spinner } from "../spinner/spinner.tsx";

import { TreeContext, useTree } from "./tree-root.tsx";
import type { TreeItemState } from "./tree-root.tsx";
import styles from "./tree.module.css";

export interface ItemProps extends Omit<ComponentProps<"div">, "id" | "role"> {
  /** Identifies the Item in the Tree's expanded and selected keys; unique within the Tree. */
  id: string;
  /** What the Item shows and is announced by. */
  label: ReactNode;
  /** The nested Items. */
  children?: ReactNode;
  /** Makes the Item expandable before its children are rendered, to load them once it expands. */
  hasChildItems?: boolean;
  /** Shows the Item as busy while the app loads its children. */
  loading?: boolean;
}

/** Hands the Item's focus, keys and clicks to the Tree. */
const handlersOf = (actions: ReturnType<typeof useTree>["actions"], item: TreeItemState) => ({
  onFocus: () => {
    actions.focus(item.id);
  },
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
    actions.keyDown(event, item);
  },
  onClick: (event: MouseEvent<HTMLElement>) => {
    actions.press(event, item);
  },
});

/** An Item of the Tree; nest Items in it to make it expandable. */
export function Item({
  id,
  label,
  children,
  hasChildItems = false,
  loading = false,
  ...props
}: ItemProps) {
  const { state, actions, meta } = useTree("Item");
  const base = useId();
  const owns = children !== undefined;
  const branch = hasChildItems || owns;
  const item = { id, branch, expanded: branch && state.expandedKeys.includes(id) };

  return (
    <>
      <div
        {...mergeProps({ className: styles["item"], ...handlersOf(actions, item) }, props)}
        role="treeitem"
        aria-labelledby={`${base}-label`}
        aria-level={meta.level}
        aria-expanded={branch ? item.expanded : undefined}
        aria-selected={state.selectedKeys?.includes(id)}
        aria-busy={loading ? true : undefined}
        aria-owns={owns ? `${base}-group` : undefined}
        tabIndex={state.active === id ? 0 : -1}
      >
        <span className={styles["chevron"]}>{branch ? <ChevronRightIcon size="sm" /> : null}</span>
        <span id={`${base}-label`}>{label}</span>
        {loading ? <Spinner aria-hidden /> : null}
      </div>
      {/* Beside the treeitem and owned by it, so the row alone takes the name, focus and events. */}
      {owns ? (
        <fieldset id={`${base}-group`} className={styles["group"]} hidden={!item.expanded}>
          <TreeContext value={{ state, actions, meta: { level: meta.level + 1 } }}>
            {children}
          </TreeContext>
        </fieldset>
      ) : null}
    </>
  );
}
