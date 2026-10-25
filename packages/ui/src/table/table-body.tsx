import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./table.module.css";

export function Body({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody {...props} className={join(styles["body"], className)} />;
}
