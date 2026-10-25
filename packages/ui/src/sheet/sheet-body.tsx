import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./sheet.module.css";

/**
 * The scrolling content between the Title and the Footer. Pass `tabIndex={-1}` to let a field
 * inside take focus first.
 */
export function Body({ tabIndex = 0, ...props }: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["body"] }, props)} tabIndex={tabIndex} />;
}
