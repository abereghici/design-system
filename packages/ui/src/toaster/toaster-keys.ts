import { useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, RefObject } from "react";

import { getDocument, useEvent } from "../events/use-event.ts";
import { platform } from "../kbd/kbd-key.tsx";
import { snapshot } from "../toast/toast.ts";

const modifiers = new Map([
  ["ctrl", "Control"],
  ["shift", "Shift"],
  ["alt", "Alt"],
]);

/** The `aria-keyshortcuts` names of a Kbd `keys` string: `"mod+z"` is `Meta+Z` on Apple. */
export const keyNames = (shortcut: string) =>
  shortcut.split("+").map((name) => {
    const id = name.trim().toLowerCase();

    if (id === "mod") return platform() === "apple" ? "Meta" : "Control";

    return modifiers.get(id) ?? id.toUpperCase();
  });

function matches(event: globalThis.KeyboardEvent, shortcut: string) {
  const names = keyNames(shortcut);

  return (
    event.key.toUpperCase() === names.at(-1) &&
    event.metaKey === names.includes("Meta") &&
    event.ctrlKey === names.includes("Control") &&
    event.shiftKey === names.includes("Shift") &&
    event.altKey === names.includes("Alt")
  );
}

const editing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.matches("input, textarea, select") || target.isContentEditable);

const hotkey = (event: globalThis.KeyboardEvent) =>
  event.altKey &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.shiftKey &&
  (event.code === "KeyT" || event.key.toLowerCase() === "t");

/** Clicks `action` on the shortcut, except while focus is in a form control or editable text. */
export function useShortcut(
  action: RefObject<HTMLButtonElement | null>,
  shortcut: string | undefined,
) {
  useEvent(
    "keydown",
    (event) => {
      if (shortcut === undefined || event.defaultPrevented || editing(event.target)) return;

      if (!matches(event, shortcut)) return;

      event.preventDefault();
      action.current?.click();
    },
    shortcut === undefined ? null : getDocument,
  );
}

function restoreFrom(before: RefObject<Element | null>) {
  const target = before.current;

  before.current = null;

  if (target instanceof HTMLElement && target.isConnected) target.focus();
}

const inside = (node: Element, target: EventTarget | null) =>
  target instanceof Node && node.contains(target);

/**
 * Alt+T focuses the Region and Escape on it returns focus; hover and focus inside pause timers.
 * Spread `handlers` on the Region.
 */
export function useFocusReturn(region: RefObject<HTMLElement | null>) {
  const before = useRef<Element | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const restore = () => {
    restoreFrom(before);
  };

  useEvent(
    "keydown",
    (event) => {
      const node = region.current;

      if (node === null || !hotkey(event) || snapshot().length === 0) return;

      event.preventDefault();

      if (!inside(node, document.activeElement)) before.current = document.activeElement;

      node.focus({ preventScroll: true });
    },
    getDocument,
  );

  return {
    restore,
    interacting: hovered || focused,
    handlers: {
      onPointerEnter: () => {
        setHovered(true);
      },
      onPointerLeave: () => {
        setHovered(false);
      },
      onFocus: (event: FocusEvent<HTMLElement>) => {
        const from = event.relatedTarget;

        if (from instanceof Element && !inside(event.currentTarget, from)) before.current = from;

        setFocused(true);
      },
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!inside(event.currentTarget, event.relatedTarget)) setFocused(false);
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Escape" || event.target !== event.currentTarget) return;

        event.preventDefault();
        restore();
      },
    },
  };
}
