import type { ComponentProps } from "react";

import { logoPath } from "./logo-path.ts";
import styles from "./logo.module.css";

export interface LogoProps extends Omit<ComponentProps<"svg">, "children"> {
  /**
   * The accessible name, for a Logo that stands alone (not beside the brand name or inside a
   * labelled link). Without it the Logo is decorative and hidden from assistive technology.
   */
  label?: string;
}

/**
 * Stâlpul cerului, the Bereghici Logo, drawn from the source files in `--ab-logo-color`.
 * 32px by default; resize it with `width` and `height`. It never renders below 16px.
 */
export function Logo({ label, className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={32}
      height={32}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="square"
      {...props}
      {...(label === undefined ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    >
      <path d={logoPath} />
    </svg>
  );
}
