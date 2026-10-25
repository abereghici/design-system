"use client";

import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "../dialog/dialog.module.css";

/** Lays out Cancel and the Action, the Action at the inline end. */
export function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["footer"], className)} />;
}
