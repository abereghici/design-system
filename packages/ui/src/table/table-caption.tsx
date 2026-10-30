import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

/** The Table's name, shown above it. */
export function Caption(props: ComponentProps<"caption">) {
  return <caption {...mergeProps({ className: styles["caption"] }, props)} />;
}
