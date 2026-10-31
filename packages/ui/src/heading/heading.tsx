import type { ComponentProps } from "react";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./heading.module.css";

const sizeOfLevel = { h1: "lg", h2: "md", h3: "sm", h4: "xs", h5: "xs", h6: "xs" } as const;

export interface HeadingProps extends ComponentProps<"h1"> {
  /**
   * The level in the page outline, which screen-reader users navigate by. It never changes the
   * look.
   */
  as: keyof typeof sizeOfLevel;
  /**
   * The look, when it should differ from the level's own: h1 `lg`, h2 `md`, h3 `sm`, h4–h6 `xs`.
   */
  size?: "xs" | "sm" | "md" | "lg";
}

/**
 * Titles a section of the page. `as` sets the level in the page outline and `size` the look, so a
 * section can sit at the right level and still look the way the design needs. For a statement that
 * isn't a section title, use Text `variant="display"`; inside a Card or Dialog, use its Title.
 *
 * Tier 1: works before hydration.
 */
export function Heading({ as: Element, size = sizeOfLevel[Element], ...props }: HeadingProps) {
  return <Element {...mergeProps({ className: styles["root"] }, props)} data-size={size} />;
}
