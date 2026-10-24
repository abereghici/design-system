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

export type MeterProps = Omit<
  ComponentProps<"meter">,
  "children" | "value" | "min" | "max" | "low" | "high" | "optimum"
> &
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
  label,
  valueLabel,
  formatOptions = { style: "percent" },
  locale,
  className,
  style,
  ...props
}: MeterProps) {
  const id = useId();
  const now = Math.min(Math.max(value, min), max);
  const text =
    valueLabel ??
    new Intl.NumberFormat(locale?.tag ?? "en", formatOptions).format(
      formatOptions.style === "percent" ? (now - min) / (max - min) : now,
    );
  return (
    <div
      data-thresholds={low === undefined && high === undefined ? undefined : ""}
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
      <meter
        aria-labelledby={label === undefined ? undefined : id}
        aria-valuetext={typeof valueLabel === "string" ? valueLabel : undefined}
        {...props}
        min={min}
        max={max}
        low={low}
        high={high}
        value={now}
        className={styles["track"]}
      />
    </div>
  );
}
