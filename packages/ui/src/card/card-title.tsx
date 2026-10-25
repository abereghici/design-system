import type { ComponentProps } from "react";

import { Slot, join } from "../slot/slot.tsx";

import styles from "./card.module.css";

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
