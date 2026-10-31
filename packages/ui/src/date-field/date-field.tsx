import type { ReactNode } from "react";

import type { SizedWrapperProps } from "../field/field-wrapper.tsx";

import type { ControlProps, DateFieldOptions } from "./date-field-control.tsx";
import { Root } from "./date-field-root.tsx";

export type { DateFieldChangeEventDetails } from "./use-date-value.ts";

export type DateFieldProps = DateFieldOptions &
  Omit<SizedWrapperProps, "validate"> &
  Omit<ControlProps, "options" | "onValidity" | "end"> & {
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
