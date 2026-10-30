import type { ComponentProps } from "react";

import "@abereghici/tokens/components/fieldset.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./fieldset.module.css";

/** Names the group of fields. */
export function Legend(props: ComponentProps<"legend">) {
  return <legend {...mergeProps({ className: styles["legend"] }, props)} />;
}
