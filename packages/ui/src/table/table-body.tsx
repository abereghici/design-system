import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

/** The rows of data. */
export function Body(props: ComponentProps<"tbody">) {
  return <tbody {...mergeProps({ className: styles["body"] }, props)} />;
}
