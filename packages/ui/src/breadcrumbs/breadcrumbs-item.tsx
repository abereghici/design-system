import type { ComponentProps } from "react";

import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import { mergeProps } from "../slot/slot.tsx";

import styles from "./breadcrumbs.module.css";

export function Item({ children, ...props }: ComponentProps<"li">) {
  return (
    <li {...mergeProps({ className: styles["item"] }, props)}>
      <ChevronRightIcon size="sm" className={styles["separator"]} />
      {children}
    </li>
  );
}
