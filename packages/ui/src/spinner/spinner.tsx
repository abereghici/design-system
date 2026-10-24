import type { ComponentProps } from "react";

import type { Labels } from "../provider/locale.tsx";
import { enUS } from "../provider/locales/en-US.ts";

import styles from "./spinner.module.css";

export interface SpinnerProps extends ComponentProps<"span"> {
  /** sm 16 · lg 24. */
  size?: "sm" | "lg";
  /**
   * Built-in strings, English by default. A Server Component can't read the Provider's
   * `locale`, so pass the shipped locale's `labels.spinner` to translate.
   */
  labels?: Partial<Labels["spinner"]>;
}

export function Spinner({ size = "sm", labels, className, ...props }: SpinnerProps) {
  const decorative = props["aria-hidden"] === true || props["aria-hidden"] === "true";
  return (
    <span
      {...(decorative
        ? {}
        : { role: "status", "aria-label": labels?.loading ?? enUS.labels.spinner.loading })}
      {...props}
      data-size={size}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
