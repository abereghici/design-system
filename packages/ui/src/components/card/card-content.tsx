import "@abereghici/tokens/components/card.css";

import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./card.module.css";

/** The Card's main content. */
export function Content(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["content"] }, props)} />;
}
