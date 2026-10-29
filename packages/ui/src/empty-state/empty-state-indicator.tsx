import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./empty-state.module.css";

/** A decorative icon or illustration above the Title. */
export function Indicator(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["indicator"] }, props)} />;
}
