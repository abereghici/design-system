import type { ComponentProps } from "react";

import "@abereghici/tokens/components/dialog.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./dialog.module.css";

/** Lays out the buttons with the primary one at the inline end. */
export function Footer(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["footer"] }, props)} />;
}
