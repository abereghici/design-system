import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./empty-state.module.css";

export function Indicator(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["indicator"] }, props)} />;
}
