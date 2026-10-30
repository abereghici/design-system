import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

/** One data cell. */
export function Cell(props: ComponentProps<"td">) {
  return <td {...mergeProps({ className: styles["cell"] }, props)} />;
}
