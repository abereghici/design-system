import type { ComponentProps } from "react";

import "@abereghici/tokens/components/sheet.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./sheet.module.css";

export interface BodyProps extends ComponentProps<"div"> {
  /** `0` lets keyboard users scroll it; `-1` lets a field inside take focus first. */
  tabIndex?: number;
}

/**
 * The scrolling content between the Title and the Footer.
 */
export function Body({ tabIndex = 0, ...props }: BodyProps) {
  return <div {...mergeProps({ className: styles["body"] }, props)} tabIndex={tabIndex} />;
}
