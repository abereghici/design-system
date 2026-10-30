import type { ComponentProps } from "react";

import "@abereghici/tokens/components/sheet.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./sheet.module.css";

/** Holds the buttons, the primary one last; it stays in view while the Body scrolls. */
export function Footer(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["footer"] }, props)} />;
}
