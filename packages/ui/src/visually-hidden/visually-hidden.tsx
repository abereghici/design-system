import type { ComponentProps } from "react";

import { Slot } from "../slot/slot.tsx";

import styles from "./visually-hidden.module.css";

export interface VisuallyHiddenProps extends ComponentProps<"span"> {
  /** Hides the single child element (a heading) instead of rendering a `<span>`. */
  asChild?: boolean;
}

/**
 * Hides its content from the screen and keeps it in the accessibility tree, for text only assistive
 * technology needs. To name an icon-only control, use IconButton's `aria-label`; to show content on
 * focus, use SkipLink; to hide content from everyone, use the `hidden` attribute.
 */
export function VisuallyHidden({ asChild = false, className, ...props }: VisuallyHiddenProps) {
  const Root = asChild ? Slot : "span";
  return (
    <Root
      {...props}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
