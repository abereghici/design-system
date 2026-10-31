import { useRef } from "react";
import type { PointerEvent } from "react";

import { useMove } from "../internal/interaction/use-move.ts";

const SWIPE_DISTANCE = 45;

const SWIPE_SPEED = 0.11;

interface Start {
  readonly x: number;
  readonly y: number;
  readonly time: number;
}

const resetSwipe = (node: HTMLElement) => {
  for (const name of ["--swipe-x", "--swipe-y"]) node.style.removeProperty(name);
};

/** Drags the toast with the pointer captured, and calls `onFling` past the distance or speed. */
export function useSwipe(onFling: () => void) {
  const start = useRef<Start | null>(null);
  const follow = (event: PointerEvent<HTMLElement>) => {
    const from = start.current;

    if (from === null) return false;

    const node = event.currentTarget;
    const x = event.clientX - from.x;
    const y = Math.max(0, event.clientY - from.y);

    node.style.setProperty("--swipe-x", `${x}px`);
    node.style.setProperty("--swipe-y", `${y}px`);

    const distance = Math.max(Math.abs(x), y);

    return (
      distance > SWIPE_DISTANCE || distance / Math.max(1, event.timeStamp - from.time) > SWIPE_SPEED
    );
  };

  return useMove<HTMLElement>({
    onMoveStart: (event) => {
      if (event.target instanceof Element && event.target.closest("button") !== null) return false;

      event.currentTarget.dataset["swiping"] = "";
      start.current = { x: event.clientX, y: event.clientY, time: event.timeStamp };

      return true;
    },
    onMove: (event) => {
      follow(event);
    },
    onMoveEnd: (event) => {
      const node = event.currentTarget;
      const flung = event.type === "pointerup" && follow(event);

      start.current = null;
      delete node.dataset["swiping"];

      if (flung) onFling();
      else resetSwipe(node);
    },
  });
}
