import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../slot/slot.tsx";

import styles from "./empty-state.module.css";

export interface TitleProps extends ComponentProps<"h3"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
  asChild?: boolean;
}

export function Title({ asChild = false, ...props }: TitleProps) {
  const Element = asChild ? Slot : "h3";
  return <Element {...mergeProps({ className: styles["title"] }, props)} />;
}
