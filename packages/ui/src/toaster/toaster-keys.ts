import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

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

function matches(event: KeyboardEvent, shortcut: string) {
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

const hotkey = (event: KeyboardEvent) =>
  event.altKey &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.shiftKey &&
  (event.code === "KeyT" || event.key.toLowerCase() === "t");

export function listenAll(target: EventTarget, handlers: Record<string, (event: Event) => void>) {
  const controller = new AbortController();
  for (const [type, handler] of Object.entries(handlers)) {
    target.addEventListener(type, handler, { signal: controller.signal });
  }
  return () => {
    controller.abort();
  };
}

/** Clicks `action` on the shortcut, except while focus is in a form control or editable text. */
export function useShortcut(
  action: RefObject<HTMLButtonElement | null>,
  shortcut: string | undefined,
) {
  useEffect(
    () =>
      listenAll(document, {
        keydown: (event) => {
          if (!(event instanceof KeyboardEvent) || shortcut === undefined) return;
          if (event.defaultPrevented || editing(event.target) || !matches(event, shortcut)) return;
          event.preventDefault();
          action.current?.click();
        },
      }),
    [action, shortcut],
  );
}

interface Tracking {
  readonly node: HTMLElement;
  readonly before: RefObject<Element | null>;
  readonly setHovered: (hovered: boolean) => void;
  readonly setFocused: (focused: boolean) => void;
  readonly restore: () => void;
}

function track({ node, before, setHovered, setFocused, restore }: Tracking) {
  const inside = (target: EventTarget | null) => target instanceof Node && node.contains(target);
  const onDocument = listenAll(document, {
    keydown: (event) => {
      if (!(event instanceof KeyboardEvent) || !hotkey(event) || snapshot().length === 0) return;
      event.preventDefault();
      if (!inside(document.activeElement)) before.current = document.activeElement;
      node.focus({ preventScroll: true });
    },
  });
  const onRegion = listenAll(node, {
    pointerenter: () => {
      setHovered(true);
    },
    pointerleave: () => {
      setHovered(false);
    },
    focusin: (event) => {
      const from = event instanceof FocusEvent ? event.relatedTarget : null;
      if (from instanceof Element && !inside(from)) before.current = from;
      setFocused(true);
    },
    focusout: (event) => {
      if (event instanceof FocusEvent && !inside(event.relatedTarget)) setFocused(false);
    },
    keydown: (event) => {
      if (!(event instanceof KeyboardEvent) || event.key !== "Escape" || event.target !== node) {
        return;
      }
      event.preventDefault();
      restore();
    },
  });
  return () => {
    onDocument();
    onRegion();
  };
}

function restoreFrom(before: RefObject<Element | null>) {
  const target = before.current;
  before.current = null;
  if (target instanceof HTMLElement && target.isConnected) target.focus();
}

/** Alt+T focuses the Region and Escape on it returns focus; hover and focus inside pause timers. */
export function useFocusReturn(region: RefObject<HTMLElement | null>) {
  const before = useRef<Element | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const node = region.current;
    const restore = () => {
      restoreFrom(before);
    };
    return node === null ? undefined : track({ node, before, setHovered, setFocused, restore });
  }, [region]);
  return {
    restore: () => {
      restoreFrom(before);
    },
    interacting: hovered || focused,
  };
}
