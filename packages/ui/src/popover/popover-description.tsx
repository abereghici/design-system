import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./popover.module.css";

export function Description({ className, ...props }: ComponentProps<"p">) {
  return <p {...props} className={join(styles["description"], className)} />;
}
