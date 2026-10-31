"use client";

import { useId, useState } from "react";

import { useDateSegments } from "../date-field/date-segments.ts";
import { FieldContext, useField } from "../field/use-field.ts";
import type { FormControl } from "../field/use-field.ts";
import type { DatePart, Temporal } from "../internal/date/date.ts";
import { Control } from "../internal/segment-field/segment-field.tsx";
import type { SegmentFieldOptions } from "../internal/segment-field/segment-field.tsx";
import type { Validity } from "../internal/segment-field/use-validity.ts";

import styles from "./date-range-picker.module.css";

interface HalfProps {
  readonly label: string;
  readonly name: string | undefined;
  /** The start date's input is the Field's own: the label and a server error go to it. */
  readonly first: boolean;
  readonly options: SegmentFieldOptions<DatePart, Temporal.PlainDate>;
  readonly onValidity: (validity: Validity) => void;
}

/**
 * One date of the range: its segments, named by its label, on its own native input. It reads the
 * Field's state, with its own name and input in place of the Field's for the end date.
 */
export function Half({ label, name, first, options, onValidity }: HalfProps) {
  const { field } = useField();
  const id = useId();
  const [control, register] = useState<FormControl | null>(null);
  const own = first
    ? {}
    : { controlId: `${id}control`, name, control, register, serverError: undefined };

  return (
    <>
      <span id={id} hidden>
        {label}
      </span>
      <FieldContext value={field && { ...field, labelId: id, ...own }}>
        <Control
          model={useDateSegments()}
          options={options}
          onValidity={onValidity}
          className={styles["half"]}
        />
      </FieldContext>
    </>
  );
}
