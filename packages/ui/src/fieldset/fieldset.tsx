import type { ComponentProps } from "react";

import styles from "./fieldset.module.css";

export interface RootProps extends ComponentProps<"fieldset"> {
  /**
   * Native `disabled`: every control inside is disabled, skipped by Tab and left out of the
   * submission. Use it when the whole group is unavailable and the Legend says why.
   */
  disabled?: boolean;
}

/** Groups related controls under one caption, its Legend. */
export function Root({ className, ...props }: RootProps) {
  return (
    <fieldset
      {...props}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}

export function Legend({ className, ...props }: ComponentProps<"legend">) {
  return (
    <legend
      {...props}
      className={className === undefined ? styles["legend"] : `${styles["legend"]} ${className}`}
    />
  );
}
