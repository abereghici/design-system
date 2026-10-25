import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./menu.module.css";

export function Separator({ className, ...props }: ComponentProps<"hr">) {
  return <hr {...props} className={join(styles["separator"], className)} />;
}
