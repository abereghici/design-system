import { cloneElement, isValidElement, type ComponentProps } from "react";

import styles from "./skeleton.module.css";

export interface SkeletonProps extends ComponentProps<"span"> {
  /**
   * `false` renders the children unchanged. An element child becomes the placeholder itself, so it
   * keeps its own size and radius.
   */
  loading?: boolean;
}

const classes = (...names: (string | undefined)[]) => names.filter(Boolean).join(" ");

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
