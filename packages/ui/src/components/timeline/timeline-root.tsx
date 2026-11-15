import { Children, cloneElement, isValidElement } from "react";
import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./timeline.module.css";

export interface RootProps extends ComponentProps<"ol"> {
  /** The position, from 0, of the last entry reached: it and every entry before it look reached. */
  active?: number;
}

/**
 * Lists events in the order they happened, such as a work history or a changelog, each on a rail
 * with a marker. Compose a `Timeline.Item` per entry as its direct children; `active` marks how far the timeline has
 * been reached. Screen readers announce it as a list and how many entries it has. For a process
 * people move through step by step, use Stepper.
 *
 * Tier 1: works before hydration.
 */
export function Root({ active = -1, children, ...props }: RootProps) {
  return (
    <ol {...mergeProps({ className: styles["root"] }, props)}>
      {Children.toArray(children)
        .filter((child) => isValidElement<{ "data-reached"?: "" }>(child))
        .map((item, index) =>
          index <= active ? cloneElement(item, { "data-reached": "" }) : item,
        )}
    </ol>
  );
}
