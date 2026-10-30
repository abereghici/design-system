import type { ComponentProps } from "react";

import "@abereghici/tokens/components/card.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./card.module.css";

/** The Card's main content. */
export function Content(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["content"] }, props)} />;
}
