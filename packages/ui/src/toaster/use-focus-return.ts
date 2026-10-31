import { useRef } from "react";
import type { FocusEvent, KeyboardEvent, RefObject } from "react";

import { getDocument, useEvent } from "../internal/dom-event/use-event.ts";
import { returnFocus } from "../internal/overlay/overlay.ts";
import { snapshot } from "../toast/toast.ts";

import { matchesShortcut } from "./use-shortcut.ts";

const inside = (node: Element, target: EventTarget | null) =>
  target instanceof Node && node.contains(target);

/** Alt+T focuses the Region and Escape on it returns focus where it was. Spread `handlers` on the Region. */
export function useFocusReturn(region: RefObject<HTMLElement | null>) {
  const before = useRef<Element | null>(null);
  const restore = () => {
    if (region.current !== null) returnFocus(region.current, before.current);

    before.current = null;
  };

  useEvent(
    "keydown",
    (event) => {
      const node = region.current;

      if (node === null || !matchesShortcut(event, "alt+t") || snapshot().length === 0) return;

      event.preventDefault();

      if (!inside(node, document.activeElement)) before.current = document.activeElement;

      node.focus({ preventScroll: true });
    },
    getDocument,
  );

  return {
    restore,
    handlers: {
      onFocus: (event: FocusEvent<HTMLElement>) => {
        const from = event.relatedTarget;

        if (from instanceof Element && !inside(event.currentTarget, from)) before.current = from;
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Escape" || event.target !== event.currentTarget) return;

        event.preventDefault();
        restore();
      },
    },
  };
}
