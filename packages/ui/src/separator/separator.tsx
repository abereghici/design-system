import type { ComponentProps } from "react";

import "@abereghici/tokens/components/separator.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./separator.module.css";

interface SeparatorBaseProps extends ComponentProps<"hr"> {
  /** Hides the line from screen readers, for a purely visual break that doesn't split content. */
  decorative?: boolean;
}

interface HorizontalProps extends SeparatorBaseProps {
  /** `vertical` between items in a row, such as toolbar groups. */
  orientation?: "horizontal";
  /** `"ornament"` adds a diamond at the center, for editorial pages only, never dense UI. */
  variant?: "solid" | "ornament";
}

interface VerticalProps extends SeparatorBaseProps {
  orientation: "vertical";
  variant?: "solid";
}

export type SeparatorProps = HorizontalProps | VerticalProps;

/**
 * A line between groups of content. Prefer space first: use it only when space alone leaves the
 * grouping unclear. A line the user drags to resize panes is a window splitter, not this component.
 */
export function Separator({
  orientation = "horizontal",
  variant = "solid",
  decorative = false,
  ...props
}: SeparatorProps) {
  return (
    <hr
      aria-orientation={orientation === "vertical" && !decorative ? "vertical" : undefined}
      role={decorative ? "none" : undefined}
      {...mergeProps({ className: styles["root"] }, props)}
      data-orientation={orientation}
      data-variant={variant}
    />
  );
}
