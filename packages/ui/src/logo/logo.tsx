import type { ComponentProps } from "react";

import styles from "./logo.module.css";

export interface LogoProps extends Omit<ComponentProps<"svg">, "children"> {
  /**
   * The accessible name, for a Logo that stands alone (not beside the brand name or inside a
   * labelled link). Without it the Logo is decorative and hidden from assistive technology.
   */
  label?: string;
}

/**
 * Stâlpul cerului, the Bereghici Logo, in `--ab-logo-color`. One em square by default, so it scales
 * with the text it sits in; size it with CSS `inline-size` and `block-size`. It never renders below
 * `--ab-logo-min-size` (16px). For an interface glyph, use an icon.
 */
export function Logo({ label, className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="square"
      {...props}
      {...(label === undefined ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    >
      <path d="m11 9-6 7 6 7M21 9l6 7-6 7M16 6l2.5 5-5 5 5 5-2.5 5" />
    </svg>
  );
}
