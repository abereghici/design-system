import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./avatar.module.css";

export interface RootProps extends ComponentProps<"span"> {
  /** `sm` beside a line of text, `md` in lists and headers. */
  size?: "sm" | "md";
}

/**
 * A person's picture, with their initials (or a generic glyph) while it loads or when it fails. The
 * Image's `alt` names the avatar whichever part shows. When the name is written beside it, use
 * `alt=""` and `aria-hidden` on Root so it isn't read twice. For the brand sign, use the Logo.
 */
export function Root({ size = "md", className, ...props }: RootProps) {
  return <span {...props} data-size={size} className={join(styles["root"], className)} />;
}
