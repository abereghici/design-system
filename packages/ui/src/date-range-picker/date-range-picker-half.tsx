"use client";

import { useId } from "react";

import { useDateSegments } from "../date-field/date-segments.ts";
import type { DatePart, Temporal } from "../internal/date/date.ts";
import { Control } from "../internal/segment-field/segment-field.tsx";
import type { SegmentFieldOptions } from "../internal/segment-field/segment-field.tsx";

import styles from "./date-range-picker.module.css";

interface HalfProps {
  readonly label: string;
  /** The start date is the Field's first control: the Field's label points to its input. */
  readonly first: boolean;
  readonly options: SegmentFieldOptions<DatePart, Temporal.PlainDate>;
}

/** One date of the range: its segments, named by its label, on its own native input in the Field. */
export function Half({ label, first, options }: HalfProps) {
  const id = useId();

  return (
    <>
      <span id={id} hidden>
        {label}
      </span>
      <Control
        model={useDateSegments()}
        options={options}
        labelId={id}
        first={first}
        className={styles["half"]}
      />
    </>
  );
}
