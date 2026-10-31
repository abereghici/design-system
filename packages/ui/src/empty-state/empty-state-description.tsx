import type { ComponentProps } from "react";

import "@abereghici/tokens/components/empty-state.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./empty-state.module.css";

/** What to do next. */
export function Description(props: ComponentProps<"p">) {
  return <p {...mergeProps({ className: styles["description"] }, props)} />;
}
