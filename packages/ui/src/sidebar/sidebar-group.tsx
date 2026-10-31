import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/sidebar.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./sidebar.module.css";

export interface GroupProps extends ComponentProps<"div"> {
  /** The group's visible name; with it the group is announced by that name. */
  label?: ReactNode;
}

/** A set of Items under an optional `label`. For a group people can fold, use CollapsibleGroup. */
export function Group({ label, children, ...props }: GroupProps) {
  const id = useId();
  const labelled = label !== undefined;

  return (
    <div
      role={labelled ? "group" : undefined}
      aria-labelledby={labelled ? id : undefined}
      {...mergeProps({ className: styles["group"] }, props)}
    >
      {labelled && (
        <div id={id} className={styles["label"]}>
          {label}
        </div>
      )}
      <ul className={styles["list"]}>{children}</ul>
    </div>
  );
}
