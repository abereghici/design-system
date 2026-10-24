import type { ComponentProps } from "react";

import { Slot } from "../slot/slot.tsx";

import styles from "./scroll-area.module.css";

export interface ScrollAreaProps extends ComponentProps<"div"> {
  /** Renders the single child element as the box: a `<section>` with a name for a named region. */
  asChild?: boolean;
}

/**
 * A bounded box whose content scrolls inside it with the native scrollbars, fading the block edges
 * while more content remains. It is a tab stop so keyboard users can scroll it; pass
 * `tabIndex={-1}` when its content is itself focusable. For a named region, render a `<section>`
 * with `aria-labelledby` through `asChild`, and only when it is a meaningful section.
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
