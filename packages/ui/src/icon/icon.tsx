import type { ComponentProps } from "react";

import styles from "./icon.module.css";

export interface IconProps extends ComponentProps<"svg"> {
  /** sm 16 · md 20 · lg 24 · xl 32. The stroke thins as the size grows. */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * The accessible name, for an icon that carries meaning on its own. Without it the icon is
   * decorative and hidden from assistive technology.
   */
  label?: string;
}

/**
 * A glyph on the 24-unit icon grid, stroked in `currentColor`. The generated icons
 * (`@platform/ui/icons/*`) render through it; pass your own `<path>` children for a custom glyph.
 */
export function Icon({ size = "md", label, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      {...props}
      {...(label === undefined ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
      data-size={size}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
