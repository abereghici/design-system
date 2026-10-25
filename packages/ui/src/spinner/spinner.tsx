import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";
import { labelsOf } from "../ui-provider/labels.ts";
import type { Labels, Locale } from "../ui-provider/locale.tsx";
import { spinner as spinnerLabels } from "../ui-provider/locales/en-US/spinner.ts";

import styles from "./spinner.module.css";

export interface SpinnerProps extends ComponentProps<"span"> {
  /** `sm` beside text or inside a control, `lg` for a region. */
  size?: "sm" | "lg";
  /**
   * A shipped locale (`@platform/ui/locales/*`). This renders on the server, where the
   * UIProvider's `locale` can't reach, so pass it for any language other than en-US.
   */
  locale?: Locale;
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: Partial<Labels["spinner"]>;
}

/**
 * Shows that something is working, for a wait of unknown length. Show it only once a wait passes
 * about 400 ms, so quick answers don't flash, and set `aria-busy` on the region it stands in. For
 * measurable progress use Progress; for content of known shape, Skeleton; inside a busy Button, its
 * `loading`.
 */
export function Spinner({ size = "sm", locale, labels, className, ...props }: SpinnerProps) {
  const decorative = props["aria-hidden"] === true || props["aria-hidden"] === "true";
  return (
    <span
      {...(decorative
        ? {}
        : {
            role: "status",
            "aria-label": labelsOf(spinnerLabels, locale?.labels.spinner, labels).loading,
          })}
      {...props}
      data-size={size}
      className={join(styles["root"], className)}
    />
  );
}
