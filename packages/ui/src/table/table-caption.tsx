import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./table.module.css";

export function Caption({ className, ...props }: ComponentProps<"caption">) {
  return <caption {...props} className={join(styles["caption"], className)} />;
}
