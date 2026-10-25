import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./table.module.css";

export function Cell(props: ComponentProps<"td">) {
  return <td {...mergeProps({ className: styles["cell"] }, props)} />;
}
