import type { ReactNode } from "react";

import type { SizedWrapperProps } from "../field/field-wrapper.tsx";
import type { DatePart, Temporal } from "../internal/date/date.ts";
import type { ControlProps } from "../internal/segment-field/segment-field.tsx";
import type { SegmentFieldChangeEventDetails } from "../internal/segment-field/use-segment-value.ts";

import { Root } from "./date-field-root.tsx";

/** `cancel()`: keeps the previous segments. */
export type DateFieldChangeEventDetails = SegmentFieldChangeEventDetails;

export interface DateFieldOptions {
  /** The chosen date, when your state holds it; `null` is no date. */
  value?: Temporal.PlainDate | null | undefined;
  /** The starting value when it holds its own state. */
  defaultValue?: Temporal.PlainDate | null | undefined;
  /** Called when the complete date changes, or becomes incomplete (`null`). */
  onValueChange?:
    | ((value: Temporal.PlainDate | null, details: DateFieldChangeEventDetails) => void)
    | undefined;
  /** The earliest date allowed; an earlier one is invalid. */
  min?: Temporal.PlainDate | undefined;
  /** The latest date allowed; a later one is invalid. */
  max?: Temporal.PlainDate | undefined;
  /** The form field name; the form submits the date as "YYYY-MM-DD". */
  name?: string | undefined;
  /** The `id` of a form elsewhere on the page that this field belongs to. */
  form?: string | undefined;
  /** Makes a complete date necessary before the form submits. */
  required?: boolean | undefined;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean | undefined;
  /**
   * Your own rule, given the date as "YYYY-MM-DD" (`""` when incomplete): return a message when
   * invalid.
   */
  validate?: ((value: string, formData: FormData) => string | null | undefined) | undefined;
  /** The error for a date typed only in part, such as "Enter a complete date". */
  incompleteMessage: string;
  /** Hints shown in the empty segments, such as `{ day: "dd", month: "mm", year: "yyyy" }`. */
  placeholders?: Readonly<Partial<Record<DatePart, string>>> | undefined;
}

export type DateFieldProps = DateFieldOptions &
  Omit<SizedWrapperProps, "validate"> &
  Omit<ControlProps<DatePart, Temporal.PlainDate>, "model" | "options" | "onValidity" | "end"> & {
    /** The visible label. Every field needs one, or an `aria-label`. */
    label?: ReactNode;
  };

/**
 * Types one date by keyboard, as day, month and year segments in the order of the user's language,
 * such as a birth date people know by heart. It submits with the form and validates like any input.
 * To pick from a month, use Calendar or DatePicker.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, the
 * browser's own date input takes its place.
 */
export function DateField(props: DateFieldProps) {
  return <Root {...props} />;
}
