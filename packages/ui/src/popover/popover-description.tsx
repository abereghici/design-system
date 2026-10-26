import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./popover.module.css";

/** Text that describes the Popover, read after its name. */
export function Description(props: ComponentProps<"p">) {
  return <p {...mergeProps({ className: styles["description"] }, props)} />;
}
