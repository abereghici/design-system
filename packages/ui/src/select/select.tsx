import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./select.module.css";

export { Root } from "./select-root.tsx";
export type { ChangeEventDetails, RootProps } from "./select-root.tsx";

export interface ItemProps extends ComponentProps<"option"> {
  value: string;
}

/** Text, optionally after a decorative Icon, which only engines with customizable select show. */
export function Item({ className, ...props }: ItemProps) {
  return <option {...props} className={join(styles["item"], className)} />;
}

export interface GroupProps extends ComponentProps<"optgroup"> {
  label: string;
}

export function Group({ className, ...props }: GroupProps) {
  return <optgroup {...props} className={join(styles["group"], className)} />;
}
