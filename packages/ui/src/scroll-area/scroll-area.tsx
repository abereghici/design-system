import type { ComponentProps } from "react";

import { Slot, join } from "../slot/slot.tsx";

import styles from "./scroll-area.module.css";

export interface ScrollAreaProps extends ComponentProps<"div"> {
  /**
   * Makes its one child the box, such as a named `<section>` that screen-reader users can jump to.
   */
  asChild?: boolean;
}

/**
 * A box whose content scrolls inside it, with faded edges while there is more to see. Keyboard users
 * can Tab to it and scroll. Use it only for content that must stay inside a region (a wide Table, a
 * long side-panel list, a terms text); if the page can scroll instead, let it.
 */
export function ScrollArea({
  asChild = false,
  tabIndex = 0,
  className,
  ...props
}: ScrollAreaProps) {
  const Root = asChild ? Slot : "div";
  return <Root {...props} tabIndex={tabIndex} className={join(styles["root"], className)} />;
}
