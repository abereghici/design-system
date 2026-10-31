"use client";

import type { ReactNode } from "react";

import "@abereghici/tokens/components/date-field.css";

import type { Temporal } from "../internal/date/date.ts";
import { SegmentField } from "../internal/segment-field/segment-field.tsx";

import type { DateFieldProps } from "./date-field.tsx";
import { useDateSegments } from "./date-segments.ts";
import styles from "./date-field.module.css";

export type RootProps = DateFieldProps & {
  /** Rendered at the inline end of the field box (the DatePicker trigger). */
  end?: ReactNode;
  isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
  unavailableMessage?: string | undefined;
  onFormReset?: (() => void) | undefined;
  children?: ReactNode;
};

/** DateField with a slot in its field box and one after it, for the DatePicker. */
export function Root({ isDateUnavailable, ...props }: RootProps) {
  return (
    <SegmentField
      {...props}
      model={useDateSegments()}
      isUnavailable={isDateUnavailable}
      classNames={{ root: styles["root"], group: styles["group"] }}
    />
  );
}
