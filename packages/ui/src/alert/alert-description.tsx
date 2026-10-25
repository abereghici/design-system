import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./alert.module.css";

export function Description({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["description"], className)} />;
}
