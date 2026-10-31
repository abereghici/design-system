"use client";

import type { ReactNode } from "react";

import "@abereghici/tokens/components/time-field.css";

import type { SizedWrapperProps } from "../field/field-wrapper.tsx";
import type { Temporal } from "../internal/date/date.ts";
import { SegmentField } from "../internal/segment-field/segment-field.tsx";
import type { ControlProps } from "../internal/segment-field/segment-field.tsx";
import type { SegmentFieldChangeEventDetails } from "../internal/segment-field/use-segment-value.ts";

import { useTimeSegments } from "./time-segments.ts";
import type { TimePart } from "./time-segments.ts";
import styles from "./time-field.module.css";

/** `cancel()`: keeps the previous segments. */
export type TimeFieldChangeEventDetails = SegmentFieldChangeEventDetails;

export type TimeFieldProps = Omit<SizedWrapperProps, "validate"> &
  Omit<ControlProps<TimePart, Temporal.PlainTime>, "model" | "options" | "onValidity" | "end"> & {
    /** The visible label. Every field needs one, or an `aria-label`. */
    label?: ReactNode;
    /** The chosen time, to the minute, when your state holds it; `null` is no time. */
    value?: Temporal.PlainTime | null | undefined;
    /** The starting time when it holds its own state. */
    defaultValue?: Temporal.PlainTime | null | undefined;
    /** Called when the complete time changes, or becomes incomplete (`null`). */
    onValueChange?:
      | ((value: Temporal.PlainTime | null, details: TimeFieldChangeEventDetails) => void)
      | undefined;
    /** The form field name; the form submits the time as "HH:MM", in 24 hours. */
    name?: string | undefined;
    /** The `id` of a form elsewhere on the page that this field belongs to. */
    form?: string | undefined;
    /** Makes a complete time necessary before the form submits. */
    required?: boolean | undefined;
    /**
     * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
     * nearby why it is unavailable.
     */
    disabled?: boolean | undefined;
    /**
     * Your own rule, given the time as "HH:MM" (`""` when incomplete): return a message when
     * invalid.
     */
    validate?: ((value: string, formData: FormData) => string | null | undefined) | undefined;
    /** The error for a time typed only in part, such as "Enter a complete time". */
    incompleteMessage: string;
    /** Hints shown in the empty segments, such as `{ hour: "hh", minute: "mm" }`. */
    placeholders?: Readonly<Partial<Record<TimePart, string>>> | undefined;
  } & ({ value: Temporal.PlainTime | null; defaultValue?: never } | { value?: never });

/**
 * Types a time of day by keyboard, as hour and minute segments in the user's language and its 12-
 * or 24-hour clock, such as an opening time. Its value is a `Temporal.PlainTime`, with no date or
 * time zone. It submits with the form and validates like any input.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, the
 * browser's own time input takes its place.
 */
export function TimeField(props: TimeFieldProps) {
  return (
    <SegmentField
      {...props}
      model={useTimeSegments()}
      classNames={{ root: undefined, group: styles["group"] }}
    />
  );
}
