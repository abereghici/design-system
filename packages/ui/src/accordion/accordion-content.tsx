"use client";

import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./accordion.module.css";

export type ContentProps = ComponentProps<"div">;

export function Content({ className, ...props }: ContentProps) {
  return <div {...props} className={join(styles["content"], className)} />;
}
