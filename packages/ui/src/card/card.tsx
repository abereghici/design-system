import { cloneElement, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";

import { Slot, join } from "../slot/slot.tsx";

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
export function Root({
  layout = "column",
  asChild = false,
  className,
  children,
  ...props
}: RootProps) {
  const root = { ...props, "data-layout": layout, className: join(styles["root"], className) };
  if (!asChild) return <div {...root}>{withLayout(children)}</div>;
  return (
    <Slot {...root}>
      {isValidElement<{ children?: ReactNode }>(children)
        ? cloneElement(children, undefined, withLayout(children.props.children))
        : children}
    </Slot>
  );
}

export function Header({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["header"], className)} />;
}

export interface TitleProps extends ComponentProps<"h3"> {
  /**
   * Makes its one child heading the Title, so the level fits the page outline. A link inside the
   * Title makes the whole card clickable and is its one tab stop.
   */
  asChild?: boolean;
}

export function Title({ asChild = false, className, ...props }: TitleProps) {
  const Element = asChild ? Slot : "h3";
  return <Element {...props} className={join(styles["title"], className)} />;
}

export function Description({ className, ...props }: ComponentProps<"p">) {
  return <p {...props} className={join(styles["description"], className)} />;
}

export function Content({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["content"], className)} />;
}

export function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["footer"], className)} />;
}
