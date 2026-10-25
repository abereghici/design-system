import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./card.module.css";

/** The top of the Card, holding its Title and Description. */
export function Header(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["header"] }, props)} />;
}
