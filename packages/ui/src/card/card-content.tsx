import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./card.module.css";

export function Content({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["content"], className)} />;
}
