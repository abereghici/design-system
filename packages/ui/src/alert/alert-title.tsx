import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./alert.module.css";

/** States the situation in words, so it reads without the colour or icon. */
export function Title(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["title"] }, props)} />;
}
