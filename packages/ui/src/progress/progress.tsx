import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import type { Locale } from "../provider/locale.tsx";

import styles from "./progress.module.css";

type Name =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

export type ProgressProps = Omit<ComponentProps<"progress">, "children" | "value" | "max"> &
  Name & {
    /** `null` is indeterminate. Clamped to `0…max`. */
    value?: number | null;
    max?: number;
    /** Shown beside the label instead of the formatted value. A string is also the `aria-valuetext`. */
    valueLabel?: ReactNode;
    /** With `style: "percent"` the fraction `value / max` is formatted, otherwise `value`. */
    formatOptions?: Intl.NumberFormatOptions;
    /**
     * A shipped locale (`@platform/ui/locales/*`) that formats it on the server. A Server Component
     * can't read the Provider's `locale`, so without it the value is en-US.
     */
    locale?: Locale;
  };

/**
 * How far a task has got, or that it is running when `value` is `null`. The value text is formatted
 * with `Intl.NumberFormat` on the server, in en-US unless you pass a shipped `locale`. For a
 * short wait inside a control use Spinner or Button's `loading`; for a measurement that isn't
 * progress use Meter.
 */
export function Progress({
  value = null,
  max = 100,
  label,
  valueLabel,
  formatOptions = { style: "percent" },
  locale,
  className,
  style,
  ...props
}: ProgressProps) {
  const id = useId();
  const now = value === null ? undefined : Math.min(Math.max(value, 0), max);
  const text =
    now === undefined
      ? undefined
      : (valueLabel ??
        new Intl.NumberFormat(locale?.tag ?? "en-US", formatOptions).format(
          formatOptions.style === "percent" ? now / max : now,
        ));
  return (
    <div
      data-state={now === undefined ? "indeterminate" : now === max ? "complete" : "loading"}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
      style={style}
    >
      {label !== undefined && (
        <div className={styles["header"]}>
          <span id={id} className={styles["label"]}>
            {label}
          </span>
          <span className={styles["value"]}>{text}</span>
        </div>
      )}
      <progress
        aria-labelledby={label === undefined ? undefined : id}
        aria-valuetext={typeof valueLabel === "string" ? valueLabel : undefined}
        {...props}
        max={max}
        value={now}
        className={styles["track"]}
      />
    </div>
  );
}
