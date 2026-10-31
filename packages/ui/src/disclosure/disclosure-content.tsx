import type { ComponentProps } from "react";

import "@abereghici/tokens/components/disclosure.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./disclosure.module.css";

export type ContentProps = ComponentProps<"div">;

/** The section shown while it is open. */
export function Content(props: ContentProps) {
  return <div {...mergeProps({ className: styles["content"] }, props)} />;
}
