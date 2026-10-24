import type { ComponentProps, ElementType, Ref } from "react";

import styles from "./text.module.css";

type Role =
  | { variant?: "body"; size?: "xs" | "sm" | "md" | "lg" }
  | { variant: "label"; size?: "sm" | "md" | "lg" }
  | { variant: "data"; size?: "sm" | "md" }
  | { variant: "code" | "display"; size?: "md" }
  | { variant: "overline"; size?: "sm" };

export type TextProps = Omit<ComponentProps<"p">, "color" | "ref"> &
  Role & {
    /** The text Emphasis. `subtlest` is the lowest that passes AA: not for text needed to act. */
    color?: "default" | "subtle" | "subtlest";
    /** The element. Purely semantic. `p` by default, `code` for `variant="code"`. */
    as?: "p" | "span" | "div" | "label" | "code";
    htmlFor?: string;
    ref?: Ref<HTMLElement>;
  };

/**
 * Sets a run of text in one type role: body, label, data, code, overline or display. A paragraph by
 * default. For a section title use Heading, for a keyboard key Kbd, and for a link Link.
 */
export function Text({
  variant = "body",
  size = variant === "overline" ? "sm" : "md",
  color = "default",
  as = variant === "code" ? "code" : "p",
  className,
  ...props
}: TextProps) {
  const Element = as as ElementType;
  return (
    <Element
      {...props}
      data-variant={variant}
      data-size={size}
      data-color={color}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
