import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { mergeProps } from "../slot/slot.tsx";

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
    /** The measurement, kept between `min` and `max`. */
    value: number;
    /** The lowest possible value. */
    min?: number;
    /** The highest possible value. */
    max?: number;
    /** The best value. With `low` and `high` it decides which range shows as good, fair or poor. */
    optimum?: number;
    /** How the value reads, such as a percent or a unit ("12 GB"). */
    formatOptions?: Intl.NumberFormatOptions;
    /**
     * The language the value is formatted in, such as "ro-RO". Pass the same one on the server and
     * in the browser; without it, the runtime's default language is used.
     */
    locale?: Intl.LocalesArgument;
  };

/**
 * A measurement within a known range: storage used, a quota, a score. With `low`, `high` and
 * `optimum` the fill turns green, amber or red, so say the same in words with `valueLabel`. For
 * progress use Progress; for a value the user sets, Slider.
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
    new Intl.NumberFormat(locale, formatOptions).format(
      formatOptions.style === "percent" ? (now - min) / (max - min) : now,
    );
  return (
    <div
      data-thresholds={low === undefined && high === undefined ? undefined : ""}
      {...mergeProps({ className: styles["root"] }, { className, style })}
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
