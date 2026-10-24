import type { ComponentProps } from "react";

import styles from "./heading.module.css";

const sizeOfLevel = { h1: "lg", h2: "md", h3: "sm", h4: "xs", h5: "xs", h6: "xs" } as const;

export interface HeadingProps extends ComponentProps<"h1"> {
  /** The heading level, from the document outline. It sets only the element, never the look. */
  as: keyof typeof sizeOfLevel;
  /** The heading type role. Follows the level when omitted: h1 lg, h2 md, h3 sm, h4–h6 xs. */
  size?: "xs" | "sm" | "md" | "lg";
}

/**
 * A native `<h1>`–`<h6>` that titles a section in the serif heading type. `as` sets the level from
 * the document outline and `size` sets the look, which follows the level unless set. For a serif
 * statement that isn't a section title, use Text `variant="display"`; for a title inside a Card or
 * Dialog, use its title Part.
 */
export function Heading({
  as: Element,
  size = sizeOfLevel[Element],
  className,
  ...props
}: HeadingProps) {
  return (
    <Element
      {...props}
      data-size={size}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
