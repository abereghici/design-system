import type { ComponentProps } from "react";

import styles from "./heading.module.css";

const sizeOfLevel = { h1: "lg", h2: "md", h3: "sm", h4: "xs", h5: "xs", h6: "xs" } as const;

export interface HeadingProps extends ComponentProps<"h1"> {
  /** The heading level, from the document outline. It sets only the element, never the look. */
  as: keyof typeof sizeOfLevel;
  /** The heading type role. Follows the level when omitted: h1 lg, h2 md, h3 sm, h4–h6 xs. */
  size?: "xs" | "sm" | "md" | "lg";
}

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
