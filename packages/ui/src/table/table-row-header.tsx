import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./table.module.css";

export function RowHeader(props: ComponentProps<"th">) {
  return <th scope="row" {...mergeProps({ className: styles["cell"] }, props)} />;
}
