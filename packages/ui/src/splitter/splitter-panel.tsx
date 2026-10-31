import type { ComponentProps } from "react";

import "@abereghici/tokens/components/splitter.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./splitter.module.css";

/** One of the two panels; its content scrolls when the panel is smaller than it. */
export function Panel(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["panel"] }, props)} />;
}
