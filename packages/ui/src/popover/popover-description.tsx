import type { ComponentProps } from "react";

import "@abereghici/tokens/components/popover.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./popover.module.css";

/** Text that describes the Popover, read after its name. */
export function Description(props: ComponentProps<"p">) {
  return <p {...mergeProps({ className: styles["description"] }, props)} />;
}
