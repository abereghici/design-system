import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./empty-state.module.css";

/** What to do next. */
export function Description(props: ComponentProps<"p">) {
  return <p {...mergeProps({ className: styles["description"] }, props)} />;
}
