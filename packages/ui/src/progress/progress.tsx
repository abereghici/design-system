import { useId, type ComponentProps, type ReactNode } from "react";

import type { Locale } from "../provider/locale.tsx";
import styles from "./progress.module.css";

type Name =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

export type ProgressProps = Omit<ComponentProps<"div">, "children"> &
  Name & {
    /** `null` is indeterminate. Clamped to `0…max`. */
    value?: number | null;
    max?: number;
    /** Shown beside the label instead of the formatted value. A string is also the `aria-valuetext`. */
    valueLabel?: ReactNode;
    /** With `style: "percent"` the fraction `value / max` is formatted, otherwise `value`. */
    formatOptions?: Intl.NumberFormatOptions;
    /**
     * A shipped locale (`@platform/ui/locales/*`) whose tag formats the value, on the server. A
     * Server Component can't read the Provider's `locale`, so without it the value is English.
     */
    locale?: Locale;
  };

export function Progress({
  value = null,
  max = 100,
  label,
  valueLabel,
  formatOptions = { style: "percent" },
  locale,
  className,
  ...props
}: ProgressProps) {
  const id = useId();
  const now = value === null ? undefined : Math.min(Math.max(value, 0), max);
  const text =
    now === undefined
      ? undefined
      : (valueLabel ??
        new Intl.NumberFormat(locale?.tag ?? "en", formatOptions).format(
          formatOptions.style === "percent" ? now / max : now,
        ));
  return (
    <div
      aria-labelledby={label === undefined ? undefined : id}
      aria-valuetext={typeof valueLabel === "string" ? valueLabel : undefined}
      {...props}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- <progress> styles only through non-standard pseudo-elements
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={now}
      data-state={now === undefined ? "indeterminate" : now === max ? "complete" : "loading"}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    >
      {label !== undefined && (
        <div className={styles["header"]}>
          <span id={id} className={styles["label"]}>
            {label}
          </span>
          <span className={styles["value"]}>{text}</span>
        </div>
      )}
      <div className={styles["track"]}>
        <div
          className={styles["indicator"]}
          style={now === undefined ? undefined : { inlineSize: `${(now / max) * 100}%` }}
        />
      </div>
    </div>
  );
}
