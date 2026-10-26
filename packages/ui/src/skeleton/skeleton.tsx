import { cloneElement, isValidElement } from "react";
import type { ComponentProps } from "react";

import styles from "./skeleton.module.css";

export interface SkeletonProps extends ComponentProps<"span"> {
  /** Shows the placeholder; set it to `false` once the content has arrived. */
  loading?: boolean;
}

const classes = (...names: (string | undefined)[]) => names.filter(Boolean).join(" ");

/**
 * Holds the place of content that is still loading, in its shape, so the page doesn't jump when it
 * arrives: wrap an element to keep its size, wrap placeholder text to cover its lines, or leave it
 * empty and size it with CSS. Set `aria-busy` on the loading region, since screen readers skip the
 * Skeleton. For a wait of unknown shape use Spinner, for a measurable task Progress.
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
