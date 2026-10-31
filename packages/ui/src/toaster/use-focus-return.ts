import { useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, RefObject } from "react";

import { getDocument, useEvent } from "../internal/dom-event/use-event.ts";
import { returnFocus } from "../internal/overlay/overlay.ts";
import { snapshot } from "../toast/toast.ts";

const hotkey = (event: globalThis.KeyboardEvent) =>
  event.altKey &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.shiftKey &&
  (event.code === "KeyT" || event.key.toLowerCase() === "t");

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
    if (region.current !== null) returnFocus(region.current, before.current);

    before.current = null;
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
