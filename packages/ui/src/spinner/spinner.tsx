import type { ComponentProps } from "react";

import type { Labels } from "../provider/locale.tsx";
import { enUS } from "../provider/locales/en-US.ts";

import styles from "./spinner.module.css";

const staves = Array.from({ length: 8 }, (_, index) => index);

export interface SpinnerProps extends ComponentProps<"span"> {
  /** sm 16 · lg 24. */
  size?: "sm" | "lg";
  /**
   * Built-in strings, English by default. A Server Component can't read the Provider's
   * `locale`, so pass the shipped locale's `labels.spinner` to translate.
   */
  labels?: Partial<Labels["spinner"]>;
}

/**
 * Eight turning staves for a wait of unknown length. Show it only once a wait passes about 400 ms:
 * start a timer when the request starts and mount the Spinner when it fires. Set `aria-busy` on the
 * region it stands in. For measurable progress use Progress; for content of known shape use
 * Skeleton; inside a busy Button use the Button's `loading`.
 */
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
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" aria-hidden>
        {staves.map((index) => (
          <line
            key={index}
            x1={12}
            y1={2}
            x2={12}
            y2={7}
            opacity={1 - index / staves.length}
            transform={`rotate(${-45 * index} 12 12)`}
          />
        ))}
      </svg>
    </span>
  );
}
