import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./select.module.css";

export interface GroupProps extends ComponentProps<"optgroup"> {
  label: string;
}

export function Group({ className, ...props }: GroupProps) {
  return <optgroup {...props} className={join(styles["group"], className)} />;
}
