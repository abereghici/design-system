import type { ComponentProps, ReactNode } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./timeline.module.css";

export interface ItemProps extends ComponentProps<"li"> {
  /** Your own decorative marker on the rail, such as an icon, in place of the dot. */
  marker?: ReactNode;
}

/** One entry of the timeline: its marker on the rail, then its content. */
export function Item({ marker, children, ...props }: ItemProps) {
  return (
    <li {...mergeProps({ className: styles["item"] }, props)}>
      <span className={styles["marker"]} aria-hidden>
        {marker ?? <span className={styles["dot"]} />}
      </span>
      <div className={styles["content"]}>{children}</div>
    </li>
  );
}
