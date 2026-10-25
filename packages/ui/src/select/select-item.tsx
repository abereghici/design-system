import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./select.module.css";

export interface ItemProps extends ComponentProps<"option"> {
  value: string;
}

/** One option: its text, optionally after a decorative icon that not every browser shows. */
export function Item({ className, ...props }: ItemProps) {
  return <option {...props} className={join(styles["item"], className)} />;
}
