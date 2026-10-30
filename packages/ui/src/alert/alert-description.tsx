import type { ComponentProps } from "react";

import "@abereghici/tokens/components/alert.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./alert.module.css";

/** What happened and what to do next. */
export function Description(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["description"] }, props)} />;
}
