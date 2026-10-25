import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./icon.module.css";

export interface IconProps extends ComponentProps<"svg"> {
  /** Match it to the text beside it; lines look equally heavy at every size. */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * The accessible name, for an icon that carries meaning on its own. Without it the icon is
   * decorative and hidden from assistive technology.
   */
  label?: string;
}

/**
 * A glyph that takes the color of the text it sits in. Import a ready icon from
 * `@platform/ui/icons/<name>`, or pass your own `<path>` children for a custom one. For the brand
 * mark, use Logo.
 */
export function Icon({ size = "md", label, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      {...mergeProps({ className: styles["root"] }, props)}
      {...(label === undefined ? { "aria-hidden": true } : { role: "img", "aria-label": label })}
      data-size={size}
    />
  );
}
