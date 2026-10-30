"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/dialog.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "../dialog/dialog.module.css";

/** Lays out Cancel and the Action, the Action at the inline end. */
export function Footer(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["footer"] }, props)} />;
}
