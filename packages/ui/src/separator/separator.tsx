import type { ComponentProps } from "react";

import styles from "./separator.module.css";

interface SeparatorBaseProps extends ComponentProps<"hr"> {
  /** Removes the line from the accessibility tree (`role="none"`), for a purely visual break. */
  decorative?: boolean;
}

interface HorizontalProps extends SeparatorBaseProps {
  orientation?: "horizontal";
  /** `"ornament"` centres the ochi diamond on the line: editorial pages only, never dense UI. */
  variant?: "solid" | "ornament";
}

interface VerticalProps extends SeparatorBaseProps {
  orientation: "vertical";
  variant?: "solid";
}

export type SeparatorProps = HorizontalProps | VerticalProps;

export function Separator({
  orientation = "horizontal",
  variant = "solid",
  decorative = false,
  className,
  ...props
}: SeparatorProps) {
  return (
    <hr
      aria-orientation={orientation === "vertical" && !decorative ? "vertical" : undefined}
      role={decorative ? "none" : undefined}
      {...props}
      data-orientation={orientation}
      data-variant={variant}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
