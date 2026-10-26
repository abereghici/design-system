"use client";

import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./accordion.module.css";

export type ContentProps = ComponentProps<"div">;

/** The section shown while its Item is open. */
export function Content(props: ContentProps) {
  return <div {...mergeProps({ className: styles["content"] }, props)} />;
}
