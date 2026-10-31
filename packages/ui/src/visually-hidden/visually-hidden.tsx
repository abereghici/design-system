import type { ComponentProps } from "react";

import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { Slot } from "../internal/slot/slot.tsx";

import styles from "./visually-hidden.module.css";

export interface VisuallyHiddenProps extends ComponentProps<"span"> {
  /** Hides its one child, such as a heading, instead of wrapping it. */
  asChild?: boolean;
}

/**
 * Hides its content from the screen and keeps it in the accessibility tree, for text only assistive
 * technology needs. To name an icon-only control, use IconButton's `aria-label`; to show content on
 * focus, use SkipLink; to hide content from everyone, use the `hidden` attribute.
 *
 * Tier 1: works before hydration.
 */
export function VisuallyHidden({ asChild = false, ...props }: VisuallyHiddenProps) {
  const Root = asChild ? Slot : "span";

  return <Root {...mergeProps({ className: styles["root"] }, props)} />;
}
