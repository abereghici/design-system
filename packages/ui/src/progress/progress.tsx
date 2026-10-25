import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import type { Locale } from "../provider/locale.tsx";
import { join } from "../slot/slot.tsx";

import styles from "./progress.module.css";

type Name =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

export type ProgressProps = Omit<ComponentProps<"progress">, "children" | "value" | "max"> &
  Name & {
    /** How far the task has got, from 0 to `max`; `null` when it can't be measured yet. */
    value?: number | null;
    /** The value at which the task is done. */
    max?: number;
    /** Words for the value, such as "3 of 8 files", shown and read instead of the number. */
    valueLabel?: ReactNode;
    /** How the value reads, such as a percent or a unit. */
    formatOptions?: Intl.NumberFormatOptions;
    /**
     * A shipped locale (`@platform/ui/locales/*`). This renders on the server, where the
     * Provider's `locale` can't reach, so pass it for any language other than en-US.
     */
    locale?: Locale;
  };

/**
 * How far a task has got, such as an upload, or that it is running when `value` is `null`. For a
 * short wait inside a control use Spinner or Button's `loading`; for a measurement that isn't
 * progress, Meter.
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
      className={join(styles["root"], className)}
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
