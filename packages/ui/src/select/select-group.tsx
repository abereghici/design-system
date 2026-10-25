import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./select.module.css";

export interface GroupProps extends ComponentProps<"optgroup"> {
  label: string;
}

export function Group(props: GroupProps) {
  return <optgroup {...mergeProps({ className: styles["group"] }, props)} />;
}
