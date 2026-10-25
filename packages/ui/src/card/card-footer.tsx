import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./card.module.css";

export function Footer(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["footer"] }, props)} />;
}
