import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./table.module.css";

export function RowHeader({ className, ...props }: ComponentProps<"th">) {
  return <th scope="row" {...props} className={join(styles["cell"], className)} />;
}
