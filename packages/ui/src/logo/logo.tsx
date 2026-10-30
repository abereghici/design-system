import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./logo.module.css";

export interface LogoProps extends Omit<ComponentProps<"svg">, "children"> {
  /**
   * The accessible name, for a Logo that stands alone (not beside the brand name or inside a
   * labelled link). Without it the Logo is decorative and hidden from assistive technology.
   */
  label?: string;
}

/**
 * The Bereghici Logo. It scales with the text it sits in; size it with CSS, and
 * it never shrinks below the smallest size that stays legible. For an interface glyph, use an icon.
 */
export function Logo({ label, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="square"
      {...mergeProps({ className: styles["root"] }, props)}
      {...(label === undefined ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
    >
      <path d="m11 9-6 7 6 7M21 9l6 7-6 7M16 6l2.5 5-5 5 5 5-2.5 5" />
    </svg>
  );
}
