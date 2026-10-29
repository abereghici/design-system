import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./card.module.css";

/** The bottom of the Card, for its actions. */
export function Footer(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["footer"] }, props)} />;
}
