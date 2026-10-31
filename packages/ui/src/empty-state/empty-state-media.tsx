import type { ComponentProps } from "react";

import "@abereghici/tokens/components/empty-state.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./empty-state.module.css";

/** A decorative icon or illustration above the Title. */
export function Media(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["media"] }, props)} />;
}
