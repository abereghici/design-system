import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./sidebar.module.css";

export interface GroupProps extends ComponentProps<"div"> {
  /** The group's visible name; with it the group is announced by that name. */
  label?: ReactNode;
  /** Lets people fold the group's links under its `label`, for long navigation. */
  collapsible?: boolean;
  /** Starts a collapsible group unfolded. */
  defaultOpen?: boolean;
}

export function Group({
  label,
  collapsible = false,
  defaultOpen = false,
  children,
  ...props
}: GroupProps) {
  const id = useId();
  const labelled = label !== undefined;
  const list = <ul className={styles["list"]}>{children}</ul>;
  return (
    <div
      role={labelled ? "group" : undefined}
      aria-labelledby={labelled ? id : undefined}
      {...mergeProps({ className: styles["group"] }, props)}
    >
      {labelled && collapsible ? (
        <details open={defaultOpen} className={styles["collapsible"]}>
          <summary id={id} className={`${styles["label"]} ${styles["summary"]}`}>
            {label}
          </summary>
          {list}
        </details>
      ) : (
        <>
          {labelled && (
            <div id={id} className={styles["label"]}>
              {label}
            </div>
          )}
          {list}
        </>
      )}
    </div>
  );
}
