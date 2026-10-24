import type { ComponentProps } from "react";

import { Slot } from "../slot/slot.tsx";

import styles from "./empty-state.module.css";

const join = (own: string | undefined, className: string | undefined) =>
  className === undefined ? own : `${own} ${className}`;

export function Root({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["root"], className)} />;
}

export function Indicator({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["indicator"], className)} />;
}

export interface TitleProps extends ComponentProps<"h3"> {
  /** Renders the one child heading (`<h2>`) so the level fits the page outline. */
  asChild?: boolean;
}

export function Title({ asChild = false, className, ...props }: TitleProps) {
  const Element = asChild ? Slot : "h3";
  return <Element {...props} className={join(styles["title"], className)} />;
}

export function Description({ className, ...props }: ComponentProps<"p">) {
  return <p {...props} className={join(styles["description"], className)} />;
}
