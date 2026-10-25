"use client";

import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./radio-group.module.css";

export type LabelProps = ComponentProps<"legend">;

export function Label({ className, ...props }: LabelProps) {
  return <legend {...props} className={join(styles["label"], className)} />;
}
