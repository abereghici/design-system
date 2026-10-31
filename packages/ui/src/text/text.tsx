import type { ComponentProps, Ref } from "react";

import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { Slot } from "../internal/slot/slot.tsx";

import styles from "./text.module.css";

type Role =
  | { variant?: "body"; size?: "xs" | "sm" | "md" | "lg" }
  | { variant: "label"; size?: "sm" | "md" | "lg" }
  | { variant: "data"; size?: "sm" | "md" }
  | { variant: "code" | "display"; size?: "md" }
  | { variant: "overline"; size?: "sm" };

export type TextProps = Omit<ComponentProps<"p">, "color" | "ref"> &
  Role & {
    /** How much it stands out. `subtlest` is for hints only, never for text people need to act. */
    color?: "default" | "subtle" | "subtlest";
    /**
     * The element, chosen for meaning, never for looks: `p` by default, `code` for
     * `variant="code"`.
     */
    as?: "p" | "span" | "div" | "label" | "code";
    /** The control it labels, with `as="label"`. */
    htmlFor?: string;
    /** The rendered element, for focus or measuring. */
    ref?: Ref<HTMLElement>;
  };

/**
 * Sets a run of text in one style: body, label, data, code, overline or display, so text looks the
 * same across the product. A paragraph by default. For a section title use Heading, for a keyboard
 * key Kbd, and for a link Link.
 *
 * Tier 1: works before hydration.
 */
export function Text({
  variant = "body",
  size,
  color = "default",
  as,
  children,
  ...props
}: TextProps) {
  const Element = as ?? (variant === "code" ? "code" : "p");

  return (
    <Slot
      {...mergeProps({ className: styles["root"] }, props)}
      data-variant={variant}
      data-size={size ?? (variant === "overline" ? "sm" : "md")}
      data-color={color}
    >
      <Element>{children}</Element>
    </Slot>
  );
}
