import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./table.module.css";

export function Body(props: ComponentProps<"tbody">) {
  return <tbody {...mergeProps({ className: styles["body"] }, props)} />;
}
