import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./dialog.module.css";

/** Lays out the buttons with the primary one at the inline end. */
export function Footer(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["footer"] }, props)} />;
}
