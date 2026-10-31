import type { RefObject } from "react";

import { getDocument, useEvent } from "../internal/dom-event/use-event.ts";
import { platform } from "../kbd/kbd-key.tsx";

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

/**
 * Whether a keydown is the shortcut. With Alt, a letter also matches by its key's position: Option
 * on macOS types another character, such as † for Alt+T.
 */
export function matchesShortcut(event: globalThis.KeyboardEvent, shortcut: string) {
  const names = keyNames(shortcut);
  const key = names.at(-1) ?? "";

  return (
    (event.key.toUpperCase() === key || (event.altKey && event.code === `Key${key}`)) &&
    event.metaKey === names.includes("Meta") &&
    event.ctrlKey === names.includes("Control") &&
    event.shiftKey === names.includes("Shift") &&
    event.altKey === names.includes("Alt")
  );
}

const editing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.matches("input, textarea, select") || target.isContentEditable);

/** Clicks `action` on the shortcut, except while focus is in a form control or editable text. */
export function useShortcut(
  action: RefObject<HTMLButtonElement | null>,
  shortcut: string | undefined,
) {
  useEvent(
    "keydown",
    (event) => {
      if (shortcut === undefined || event.defaultPrevented || editing(event.target)) return;

      if (!matchesShortcut(event, shortcut)) return;

      event.preventDefault();
      action.current?.click();
    },
    shortcut === undefined ? null : getDocument,
  );
}
