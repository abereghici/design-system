import "@abereghici/tokens/components/description-list.css";

import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./description-list.module.css";

export type TermProps = ComponentProps<"dt">;

/** What the value is: keep it short, so the column of terms stays narrow. */
export function Term(props: TermProps) {
  return <dt {...mergeProps({ className: styles["term"] }, props)} />;
}
