import { cloneElement, isValidElement } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/skeleton.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./skeleton.module.css";

export interface SkeletonProps extends ComponentProps<"span"> {
  /** Shows the placeholder; set it to `false` once the content has arrived. */
  loading?: boolean;
}

/**
 * Holds the place of content that is still loading, in its shape, so the page doesn't jump when it
 * arrives: wrap an element to keep its size, wrap placeholder text to cover its lines, or leave it
 * empty and size it with CSS. Set `aria-busy` on the loading region, since screen readers skip the
 * Skeleton. For a wait of unknown shape use Spinner, for a measurable task Progress.
 *
 * Tier 1: works before hydration.
 */
export function Skeleton({ loading = true, children, ...props }: SkeletonProps) {
  if (!loading) return children;

  const placeholder = mergeProps(props, {
    "aria-hidden": true,
    inert: true,
    tabIndex: -1,
    "data-loading": "",
  });

  return isValidElement<ComponentProps<"span">>(children) ? (
    cloneElement(
      children,
      mergeProps({ className: styles["root"] }, mergeProps(children.props, placeholder)),
    )
  ) : (
    <span {...mergeProps({ className: `${styles["root"]} ${styles["inline"]}` }, placeholder)}>
      {children}
    </span>
  );
}
