import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../slot/slot.tsx";

import styles from "./scroll-area.module.css";

export interface ScrollAreaProps extends ComponentProps<"div"> {
  /**
   * Makes its one child the box, such as a named `<section>` that screen-reader users can jump to.
   */
  asChild?: boolean;
  /** `0` lets keyboard users Tab to it and scroll; `-1` when a focusable child already lets them. */
  tabIndex?: number;
}

/**
 * A box whose content scrolls inside it, with faded edges while there is more to see. Keyboard users
 * can Tab to it and scroll. Use it only for content that must stay inside a region (a wide Table, a
 * long side-panel list, a terms text); if the page can scroll instead, let it.
 */
export function ScrollArea({ asChild = false, tabIndex = 0, ...props }: ScrollAreaProps) {
  const Root = asChild ? Slot : "div";
  return <Root {...mergeProps({ className: styles["root"] }, props)} tabIndex={tabIndex} />;
}
