import { cloneElement, isValidElement } from "react";
import type { ComponentProps } from "react";

import styles from "./skeleton.module.css";

export interface SkeletonProps extends ComponentProps<"span"> {
  /**
   * `false` renders the children unchanged. An element child becomes the placeholder itself, so it
   * keeps its own size and radius.
   */
  loading?: boolean;
}

const classes = (...names: (string | undefined)[]) => names.filter(Boolean).join(" ");

/**
 * Holds the place of content that is still loading, in its shape: wrap an element to keep its size
 * and radius, wrap placeholder text to cover its lines, or leave it empty and size it with
 * `className`. Set `aria-busy` on the loading region; Skeleton hides itself from assistive
 * technology. For a wait of unknown shape use Spinner, for a measurable task Progress.
 */
export function Skeleton({ loading = true, children, className, ...props }: SkeletonProps) {
  if (!loading) return children;
  const placeholder = {
    ...props,
    "aria-hidden": true,
    inert: true,
    tabIndex: -1,
    "data-loading": "",
  };
  return isValidElement<{ className?: string }>(children) ? (
    cloneElement(children, {
      ...placeholder,
      className: classes(styles["root"], children.props.className, className),
    })
  ) : (
    <span {...placeholder} className={classes(styles["root"], styles["inline"], className)}>
      {children}
    </span>
  );
}
