import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./menu.module.css";

export function Separator(props: ComponentProps<"hr">) {
  return <hr {...mergeProps({ className: styles["separator"] }, props)} />;
}
