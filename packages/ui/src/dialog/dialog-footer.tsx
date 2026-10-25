import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./dialog.module.css";

/** Lays out the buttons with the primary one at the inline end. */
export function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["footer"], className)} />;
}
