import { cloneElement, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";

import styles from "./card.module.css";

export interface RootProps extends ComponentProps<"div"> {
  /**
   * `"horizontal"` moves the Footer beside the content once the card is wide enough, for list-like
   * cards.
   */
  orientation?: "vertical" | "horizontal";
  /** Makes its one child the card, such as an `<article>` or an `<li>` in a list of cards. */
  asChild?: boolean;
}

/**
 * Groups content about one subject so cards can be scanned and compared. Compose `Card.Header`
 * (`Title`, `Description`), `Content` and `Footer`; a link inside `Card.Title` makes the whole card
 * clickable. Don't nest cards or use one as a page section: separate other content with space or a
 * Separator.
 *
 * Tier 1: works before hydration.
 */
export function Root({ orientation = "vertical", asChild = false, children, ...props }: RootProps) {
  const root = {
    ...mergeProps({ className: styles["root"] }, props),
    "data-orientation": orientation,
  };

  if (!asChild) {
    return (
      <div {...root}>
        <div className={styles["layout"]}>{children}</div>
      </div>
    );
  }

  return (
    <Slot {...root}>
      {isValidElement<{ children?: ReactNode }>(children)
        ? cloneElement(
            children,
            undefined,
            <div className={styles["layout"]}>{children.props.children}</div>,
          )
        : children}
    </Slot>
  );
}
