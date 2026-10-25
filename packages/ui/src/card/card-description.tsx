import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./card.module.css";

export function Description({ className, ...props }: ComponentProps<"p">) {
  return <p {...props} className={join(styles["description"], className)} />;
}
