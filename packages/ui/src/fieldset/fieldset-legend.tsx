import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./fieldset.module.css";

export function Legend(props: ComponentProps<"legend">) {
  return <legend {...mergeProps({ className: styles["legend"] }, props)} />;
}
