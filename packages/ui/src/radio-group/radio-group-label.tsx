"use client";

import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./radio-group.module.css";

export type LabelProps = ComponentProps<"legend">;

export function Label(props: LabelProps) {
  return <legend {...mergeProps({ className: styles["label"] }, props)} />;
}
