import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";
import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";

import styles from "./breadcrumbs.module.css";

/** One step of the trail, holding a Link. */
export function Item({ children, ...props }: ComponentProps<"li">) {
  return (
    <li {...mergeProps({ className: styles["item"] }, props)}>
      <ChevronRightIcon size="sm" className={styles["separator"]} />
      {children}
    </li>
  );
}
