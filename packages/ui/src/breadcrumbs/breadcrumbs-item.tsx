import type { ComponentProps } from "react";

import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import { join } from "../slot/slot.tsx";

import styles from "./breadcrumbs.module.css";

export function Item({ className, children, ...props }: ComponentProps<"li">) {
  return (
    <li {...props} className={join(styles["item"], className)}>
      <ChevronRightIcon size="sm" className={styles["separator"]} />
      {children}
    </li>
  );
}
