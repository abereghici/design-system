import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./alert.module.css";

export function Description(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["description"] }, props)} />;
}
