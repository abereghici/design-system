import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./table.module.css";

export function Cell({ className, ...props }: ComponentProps<"td">) {
  return <td {...props} className={join(styles["cell"], className)} />;
}
