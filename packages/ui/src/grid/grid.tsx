import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../internal/slot/slot.tsx";

import styles from "./grid.module.css";

declare module "react" {
  interface CSSProperties {
    "--gap"?: string;
    "--min"?: string;
  }
}

export interface GridProps extends ComponentProps<"div"> {
  /** The space between rows and between columns. */
  gap?:
    | `stack-${"xs" | "sm" | "md" | "lg" | "xl" | "2xl"}`
    | `inline-${"xs" | "sm" | "md" | "lg" | "xl"}`;
  /** The narrowest a column may get before the grid drops a column. */
  min?: `container-${"2xs" | "xs" | "sm" | "md" | "lg"}`;
  /** Makes its one child the grid, such as a list, so its semantics stay. */
  asChild?: boolean;
}

/**
 * Lays out its children in as many equal columns as fit, each no narrower than `min`, so a set of
 * cards reflows at any container width with no breakpoints. Works before hydration (Tier 1): it is
 * plain HTML and CSS.
 */
export function Grid({
  gap = "stack-md",
  min = "container-2xs",
  asChild = false,
  ...props
}: GridProps) {
  const Element = asChild ? Slot : "div";

  return (
    <Element
      {...mergeProps(
        {
          className: styles["root"],
          style: { "--gap": `var(--ab-space-${gap})`, "--min": `var(--ab-size-${min})` },
        },
        props,
      )}
    />
  );
}
