import { useRef } from "react";
import type { PointerEvent } from "react";

interface MoveHandlers<Target extends Element> {
  /** A primary press; return `false` to leave it alone, such as a press on a button inside. */
  readonly onMoveStart: (event: PointerEvent<Target>) => boolean;
  /** Each move of the pressed pointer until the press ends. */
  readonly onMove: (event: PointerEvent<Target>) => void;
  /** The `pointerup` or `pointercancel` that ends the press. */
  readonly onMoveEnd: (event: PointerEvent<Target>) => void;
}

/**
 * A pointer drag: a primary press captures the pointer, so the move follows it past the element's
 * edge until the pointer lifts or the browser cancels it. Spread its props on the pressed element.
 */
export function useMove<Target extends Element>({
  onMoveStart,
  onMove,
  onMoveEnd,
}: MoveHandlers<Target>) {
  const pointer = useRef<number | null>(null);
  const end = (event: PointerEvent<Target>) => {
    if (event.pointerId !== pointer.current) return;

    pointer.current = null;
    onMoveEnd(event);
  };

  return {
    onPointerDown: (event: PointerEvent<Target>) => {
      if (event.button !== 0 || !onMoveStart(event)) return;

      pointer.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: PointerEvent<Target>) => {
      if (event.pointerId === pointer.current) onMove(event);
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
}
