import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";

import styles from "./visually-hidden.module.css";

export interface VisuallyHiddenProps extends ComponentProps<"span"> {
  /** Hides the single child element (a heading) instead of rendering a `<span>`. */
  asChild?: boolean;
}

/**
 * Hides content from the screen and keeps it for assistive technology. It is absolutely
 * positioned, so give it a positioned ancestor. Never put focusable content in it.
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
