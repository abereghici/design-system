import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./empty-state.module.css";

export function Indicator({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["indicator"], className)} />;
}
