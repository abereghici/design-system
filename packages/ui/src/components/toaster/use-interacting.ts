import { useState } from "react";
import type { FocusEvent } from "react";

/** Whether the pointer is over the element or focus is inside it. Spread `handlers` on the element. */
export function useInteracting() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return {
    interacting: hovered || focused,
    handlers: {
      onPointerEnter: () => {
        setHovered(true);
      },
      onPointerLeave: () => {
        setHovered(false);
      },
      onFocus: () => {
        setFocused(true);
      },
      onBlur: (event: FocusEvent<HTMLElement>) => {
        const to = event.relatedTarget;

        if (!(to instanceof Node && event.currentTarget.contains(to))) setFocused(false);
      },
    },
  };
}
