import { useId } from "react";
import type { CSSProperties, ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/progress.css";

import type { Labelled } from "../internal/accessible-name/accessible-name.ts";
import { FormattedNumber } from "../internal/locale/formatted-number.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./progress.module.css";

export type ProgressProps = Omit<
  ComponentProps<"progress">,
  "children" | "className" | "style" | "value" | "max"
> &
  Labelled<"label"> & {
    /** How far the task has got, from 0 to `max`; `null` when it can't be measured yet. */
    value?: number | null;
    /** The value at which the task is done. */
    max?: number;
    /** Words for the value, such as "3 of 8 files", shown and read instead of the number. */
    valueLabel?: ReactNode;
    /** How the value reads, such as a percent or a unit. */
    formatOptions?: Intl.NumberFormatOptions;
    /**
     * Styles the whole Progress, its label and value included. `ref`, `id` and the other attributes
     * reach the bar itself, which assistive technology reads.
     */
    className?: string | undefined;
    /** Styles the whole Progress, its label and value included. */
    style?: CSSProperties | undefined;
  };

/**
 * How far a task has got, such as an upload, or that it is running when `value` is `null`. For a
 * short wait inside a control use Spinner or Button's `loading`; for a measurement that isn't
 * progress, Meter.
 *
 * Tier 1: works before hydration.
 */
export function Progress({
  value = null,
  max = 100,
  label,
  valueLabel,
  formatOptions = { style: "percent" },
  className,
  style,
  ...props
}: ProgressProps) {
  const id = useId();
  const now = value === null ? undefined : Math.min(Math.max(value, 0), max);
  const text =
    now === undefined
      ? undefined
      : (valueLabel ?? (
          <FormattedNumber
            {...formatOptions}
            value={formatOptions.style === "percent" ? now / max : now}
          />
        ));

  return (
    <div
      data-state={now === undefined ? "indeterminate" : now === max ? "complete" : "loading"}
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
