import type { ComponentProps } from "react";

import "@abereghici/tokens/components/card.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./card.module.css";

/** Supporting text under the Title. */
export function Description(props: ComponentProps<"p">) {
  return <p {...mergeProps({ className: styles["description"] }, props)} />;
}
