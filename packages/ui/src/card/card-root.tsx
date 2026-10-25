import { cloneElement, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";

import { Slot, mergeProps } from "../slot/slot.tsx";

import styles from "./card.module.css";

const withLayout = (content: ReactNode) => <div className={styles["layout"]}>{content}</div>;

export interface RootProps extends ComponentProps<"div"> {
  /**
   * `"row"` moves the Footer beside the content once the card is wide enough, for list-like cards.
   */
  layout?: "column" | "row";
  /** Makes its one child the card, such as an `<article>` or an `<li>` in a list of cards. */
  asChild?: boolean;
}

/**
 * Groups content about one subject so cards can be scanned and compared. Compose `Card.Header`
 * (`Title`, `Description`), `Content` and `Footer`; a link inside `Card.Title` makes the whole card
 * clickable. Don't nest cards or use one as a page section: separate other content with space or a
 * Separator.
 */
export function Root({ layout = "column", asChild = false, children, ...props }: RootProps) {
  const root = { ...mergeProps({ className: styles["root"] }, props), "data-layout": layout };
  if (!asChild) return <div {...root}>{withLayout(children)}</div>;
  return (
    <Slot {...root}>
      {isValidElement<{ children?: ReactNode }>(children)
        ? cloneElement(children, undefined, withLayout(children.props.children))
        : children}
    </Slot>
  );
}
