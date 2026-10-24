import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import type { Locale } from "../provider/locale.tsx";

import styles from "./meter.module.css";

type Name =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

type Thresholds =
  | { low?: undefined; high?: undefined; valueLabel?: ReactNode }
  | { low: number; high?: number; valueLabel: string }
  | { low?: number; high: number; valueLabel: string };

export type MeterProps = Omit<ComponentProps<"div">, "children"> &
  Name &
  Thresholds & {
    /** Clamped to `min…max`. */
    value: number;
    min?: number;
    max?: number;
    /** The preferred value. With `low` and `high` it picks which region is good, as on `<meter>`. */
    optimum?: number;
    /** With `style: "percent"` the fraction of the range is formatted, otherwise `value`. */
    formatOptions?: Intl.NumberFormatOptions;
    /**
     * A shipped locale (`@platform/ui/locales/*`) whose tag formats the value, on the server. A
     * Server Component can't read the Provider's `locale`, so without it the value is English.
     */
    locale?: Locale;
  };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function region(
  value: number,
  min: number,
  max: number,
  low?: number,
  high?: number,
  optimum?: number,
) {
  const lo = clamp(low ?? min, min, max);
  const hi = clamp(high ?? max, lo, max);
  const best = clamp(optimum ?? (min + max) / 2, min, max);
  if (best < lo) return value <= lo ? "optimum" : value <= hi ? "suboptimum" : "even-less-good";
  if (best > hi) return value >= hi ? "optimum" : value >= lo ? "suboptimum" : "even-less-good";
  return value >= lo && value <= hi ? "optimum" : "suboptimum";
}

/**
 * A measurement within a known range: storage used, a quota, a score. With `low`, `high` and
 * `optimum` the fill takes the success, warning or danger colour of the HTML meter's regions, and a
 * string `valueLabel` must say the same in words. The value text is formatted with
 * `Intl.NumberFormat` on the server, in English unless you pass a shipped `locale`. For progress
 * use Progress; for a value the user sets, Slider.
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  label,
  valueLabel,
  formatOptions = { style: "percent" },
  locale,
  className,
  ...props
}: MeterProps) {
  const id = useId();
  const now = clamp(value, min, max);
  const fraction = (now - min) / (max - min);
  const thresholds = low !== undefined || high !== undefined;
  return (
    <div
      aria-labelledby={label === undefined ? undefined : id}
      aria-valuetext={typeof valueLabel === "string" ? valueLabel : undefined}
      {...props}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- <meter> styles only through non-standard pseudo-elements
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={now}
      data-region={thresholds ? region(now, min, max, low, high, optimum) : undefined}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    >
      {label !== undefined && (
        <div className={styles["header"]}>
          <span id={id} className={styles["label"]}>
            {label}
          </span>
          <span className={styles["value"]}>
            {valueLabel ??
              new Intl.NumberFormat(locale?.tag ?? "en", formatOptions).format(
                formatOptions.style === "percent" ? fraction : now,
              )}
          </span>
        </div>
      )}
      <div className={styles["track"]}>
        <div className={styles["indicator"]} style={{ inlineSize: `${fraction * 100}%` }} />
      </div>
    </div>
  );
}
