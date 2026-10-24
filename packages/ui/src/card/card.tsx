import { cloneElement, isValidElement, type ComponentProps, type ReactNode } from "react";

import { Slot } from "../slot/slot.tsx";
import styles from "./card.module.css";

const join = (own: string | undefined, className: string | undefined) =>
  className === undefined ? own : `${own} ${className}`;

const body = (content: ReactNode) => <div className={styles["layout"]}>{content}</div>;

export interface RootProps extends ComponentProps<"div"> {
  /** `"row"` puts the Footer at the inline end once the card itself is at least 480 px wide. */
  layout?: "column" | "row";
  /** Renders the one child element (`<article>`, `<li>`) as the card. */
  asChild?: boolean;
}

export function Root({ layout = "column", asChild = false, className, children, ...props }: RootProps) {
  const root = { ...props, "data-layout": layout, className: join(styles["root"], className) };
  if (!asChild) return <div {...root}>{body(children)}</div>;
  return (
    <Slot {...root}>
      {isValidElement<{ children?: ReactNode }>(children)
        ? cloneElement(children, undefined, body(children.props.children))
        : children}
    </Slot>
  );
}

export function Header({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["header"], className)} />;
}

export interface TitleProps extends ComponentProps<"h3"> {
  /**
   * Renders the one child heading (`<h2>`) so the level fits the page outline. A link inside the
   * Title stretches over the whole card and is its one tab stop.
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
