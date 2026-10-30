import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../internal/slot/slot.tsx";

import styles from "./inline.module.css";

declare module "react" {
  interface CSSProperties {
    "--gap"?: string;
    "--align"?: string;
    "--justify"?: string;
  }
}

export interface InlineProps extends ComponentProps<"div"> {
  /** The space between children, and between the lines they wrap onto. */
  gap?: `inline-${"xs" | "sm" | "md" | "lg" | "xl"}`;
  /** Where children of different heights sit on their line. */
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  /** Where children sit along the line when they don't fill it. */
  justify?: "start" | "center" | "end" | "space-between";
  /** Makes its one child the row, such as a list, so its semantics stay. */
  asChild?: boolean;
}

/**
 * Lays out its children side by side in reading order, spaced by an inline space token, and wraps
 * them onto the next line when they don't fit, such as a row of actions or tags. Works before
 * hydration (Tier 1): it is plain HTML and CSS.
 */
export function Inline({
  gap = "inline-sm",
  align = "center",
  justify = "start",
  asChild = false,
  ...props
}: InlineProps) {
  const Element = asChild ? Slot : "div";

  return (
    <Element
      {...mergeProps(
        {
          className: styles["root"],
          style: { "--gap": `var(--ab-space-${gap})`, "--align": align, "--justify": justify },
        },
        props,
      )}
    />
  );
}
