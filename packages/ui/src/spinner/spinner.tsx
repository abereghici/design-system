import type { ComponentProps } from "react";

import type { Labels, Locale } from "../provider/locale.tsx";
import { spinner as spinnerLabels } from "../provider/locales/en-US/spinner.ts";
import { join } from "../slot/slot.tsx";

import styles from "./spinner.module.css";

export interface SpinnerProps extends ComponentProps<"span"> {
  /** sm 16 · lg 24. */
  size?: "sm" | "lg";
  /**
   * A shipped locale (`@platform/ui/locales/*`) that translates it on the server. A Server Component
   * can't read the Provider's `locale`, so without it the name is en-US.
   */
  locale?: Locale;
  /** Overrides the locale's labels. */
  labels?: Partial<Labels["spinner"]>;
}

/**
 * Eight turning staves for a wait of unknown length. Show it only once a wait passes about 400 ms:
 * start a timer when the request starts and mount the Spinner when it fires. Set `aria-busy` on the
 * region it stands in. For measurable progress use Progress; for content of known shape use
 * Skeleton; inside a busy Button use the Button's `loading`.
 */
export function Spinner({ size = "sm", locale, labels, className, ...props }: SpinnerProps) {
  const decorative = props["aria-hidden"] === true || props["aria-hidden"] === "true";
  return (
    <span
      {...(decorative
        ? {}
        : {
            role: "status",
            "aria-label":
              labels?.loading ?? locale?.labels.spinner.loading ?? spinnerLabels.loading,
          })}
      {...props}
      data-size={size}
      className={join(styles["root"], className)}
    />
  );
}
