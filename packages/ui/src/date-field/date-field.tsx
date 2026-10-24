"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import * as Field from "../field/field.tsx";

import { Control } from "./date-field-control.tsx";
import type { ControlProps, DateFieldOptions } from "./date-field-control.tsx";
import type { Validity } from "./date-field-validity.ts";

export type { DateFieldChangeEventDetails } from "./date-field-control.tsx";

export type DateFieldProps = DateFieldOptions &
  Omit<ControlProps, "options" | "onValidity"> & {
    label?: ReactNode;
    /** Helper text below the field, replaced by the error while invalid. */
    description?: ReactNode;
    /** Shown only after interaction while invalid. Defaults to the browser's `validationMessage`. */
    errorMessage?: ReactNode;
    /** Forces the invalid state, e.g. from an external validation library. */
    invalid?: boolean | undefined;
    /** Exposed as `data-size`. */
    size?: "md" | "lg";
  };

/**
 * Entry of one calendar date by keyboard: day, month and year segments in the Locale's order, with
 * a hidden native date input for the form value and validation. To pick from a month, use Calendar
 * or DatePicker.
 */
export function DateField({
  label,
  description,
  errorMessage,
  invalid,
  size = "md",
  className,
  style,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  name,
  form,
  required,
  disabled,
  validate,
  labels,
  ...props
}: DateFieldProps) {
  const [validity, setValidity] = useState<Validity>({ invalid: false, message: "" });
  const options = { value, defaultValue, onValueChange, min, max, name, form, required };
  return (
    <Field.Root
      className={className}
      style={style}
      data-size={size}
      name={name}
      invalid={invalid ?? (validity.invalid || undefined)}
      disabled={disabled}
    >
      {label !== undefined && <Field.Label>{label}</Field.Label>}
      <Control
        {...props}
        options={{ ...options, disabled, validate, labels }}
        onValidity={setValidity}
      />
      {description !== undefined && <Field.Description>{description}</Field.Description>}
      <Field.Error>{errorMessage ?? (validity.invalid ? validity.message : undefined)}</Field.Error>
    </Field.Root>
  );
}
