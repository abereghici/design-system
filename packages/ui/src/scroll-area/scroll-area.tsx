import type { ComponentProps } from "react";

import { Slot } from "../slot/slot.tsx";

import styles from "./scroll-area.module.css";

export interface ScrollAreaProps extends ComponentProps<"div"> {
  /** Renders the single child element as the box: a `<section>` with a name for a named region. */
  asChild?: boolean;
}

/**
 * A bounded box whose content scrolls inside it with the browser's own scrolling and scrollbars,
 * and fades its top and bottom edges while there is more to scroll. It is a tab stop, so keyboard
 * users can scroll it. Use it only for content that must stay inside a region (a wide Table, a long
 * side-panel list, a terms text); if the page can scroll instead, let it.
 */
export function ScrollArea({
  asChild = false,
  tabIndex = 0,
  className,
  ...props
}: ScrollAreaProps) {
  const Root = asChild ? Slot : "div";
  return (
    <Root
      {...props}
      tabIndex={tabIndex}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
