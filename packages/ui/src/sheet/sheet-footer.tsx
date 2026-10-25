import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./sheet.module.css";

/** Holds the buttons, the primary one last; it stays in view while the Body scrolls. */
export function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["footer"], className)} />;
}
