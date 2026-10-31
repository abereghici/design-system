import type { KeyboardEvent, PointerEvent, ToggleEvent } from "react";

import { typeahead } from "../listbox/typeahead.ts";

/** Menus to open with focus on their last item, such as one opened with ArrowUp. */
export const focusLast = new WeakSet<Element>();

const isDisabled = (item: Element) => item.getAttribute("aria-disabled") === "true";

/** A menu's items, in order. */
export const itemsOf = (menu: Element) => [
  ...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
];

function navigate(event: KeyboardEvent<HTMLElement>) {
  const items = itemsOf(event.currentTarget);
  const from = event.target instanceof HTMLElement ? items.indexOf(event.target) : -1;
  const steps: Record<string, number | undefined> = {
    ArrowDown: from + 1,
    ArrowUp: from < 0 ? -1 : from - 1,
    Home: 0,
    End: -1,
  };
  const to = steps[event.key];

  if (to === undefined) return false;

  items.at(to % items.length)?.focus();

  return true;
}

/**
 * Moves focus among a menu's items: to the first one (or the last, after `focusLast`) as it opens,
 * with the arrow keys, Home, End and typeahead, and to the item under a mouse or pen.
 */
export const menuNavigation = {
  onToggle: (event: ToggleEvent<HTMLElement>) => {
    if (event.newState !== "open") return;

    const items = itemsOf(event.currentTarget);

    (focusLast.delete(event.currentTarget) ? items.at(-1) : items[0])?.focus();
  },
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
    if (navigate(event)) {
      event.preventDefault();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const from = event.target instanceof Element ? event.target : null;
      const items = itemsOf(event.currentTarget).filter((item) => !isDisabled(item));

      typeahead(event.currentTarget, event.key, items, from)?.focus();
    }
  },
  onPointerMove: (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;

    const item =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[role^="menuitem"]')
        : null;
    const target = item !== null && !isDisabled(item) ? item : event.currentTarget;

    if (document.activeElement !== target) target.focus({ preventScroll: true });
  },
};
