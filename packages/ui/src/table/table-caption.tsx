import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./table.module.css";

export function Caption(props: ComponentProps<"caption">) {
  return <caption {...mergeProps({ className: styles["caption"] }, props)} />;
}
