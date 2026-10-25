import type { ComponentProps } from "react";

import { Slot, join } from "../slot/slot.tsx";

import styles from "./empty-state.module.css";

/**
 * Stands in for content that isn't there yet (an empty list, a search with no results). The Title
 * says what is missing, the Description why or what to do, and the actions after it offer the next
 * step. Screen readers don't announce it when it appears: announce a filter's empty result from your
 * own `role="status"` region. For a load still running, use Skeleton or Spinner; for an error, an
 * Alert.
 */
export function Root({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["root"], className)} />;
}

export function Indicator({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["indicator"], className)} />;
}

export interface TitleProps extends ComponentProps<"h3"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
  asChild?: boolean;
}

export function Title({ asChild = false, className, ...props }: TitleProps) {
  const Element = asChild ? Slot : "h3";
  return <Element {...props} className={join(styles["title"], className)} />;
}

export function Description({ className, ...props }: ComponentProps<"p">) {
  return <p {...props} className={join(styles["description"], className)} />;
}
