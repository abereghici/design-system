"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import * as Field from "../field/field.tsx";
import { mergeProps } from "../slot/slot.tsx";

import { Control } from "./date-field-control.tsx";
import type { ControlProps, DateFieldOptions } from "./date-field-control.tsx";
import type { Validity } from "./date-field-validity.ts";
import styles from "./date-field.module.css";

export type { DateFieldChangeEventDetails } from "./date-field-editing.ts";

export type DateFieldProps = DateFieldOptions &
  Omit<ControlProps, "options" | "onValidity" | "end"> & {
    /** The visible label. Every field needs one, or an `aria-label`. */
    label?: ReactNode;
    /**
     * Helper text under the field, such as a format hint; the error message takes its place while
     * invalid.
     */
    description?: ReactNode;
    /**
     * What to fix, shown once the user has interacted and the value is invalid. Without it the
     * browser's own message is shown.
     */
    errorMessage?: ReactNode;
    /** Marks the value invalid from outside, such as a server or validation library result. */
    invalid?: boolean | undefined;
    /** `lg` for prominent or spacious forms. Touch screens get larger targets on their own. */
    size?: "md" | "lg";
  };

type FrameProps = DateFieldProps &
  Pick<ControlProps, "end"> &
  Pick<ControlProps["options"], "isDateUnavailable" | "unavailableMessage" | "onFormReset"> & {
    children?: ReactNode;
  };

/**
 * Types one date by keyboard, as day, month and year segments in the order of the user's language,
 * such as a birth date people know by heart. It submits with the form and validates like any input.
 * To pick from a month, use Calendar or DatePicker.
 */
export function DateField(props: DateFieldProps) {
  return <DateFieldFrame {...props} />;
}

/** DateField with a slot in its field box and one after it, for the DatePicker. */
export function DateFieldFrame({
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
  locale,
  incompleteMessage,
  placeholders,
  isDateUnavailable,
  unavailableMessage,
  onFormReset,
  children,
  ...props
}: FrameProps) {
  const [validity, setValidity] = useState<Validity>({ invalid: false, message: "" });
  const options = { value, defaultValue, onValueChange, min, max, name, form, required, locale };
  const messages = { incompleteMessage, unavailableMessage, placeholders };

  return (
    <Field.Root
      {...mergeProps({ className: styles["root"] }, { className, style })}
      data-size={size}
      name={name}
      invalid={invalid ?? (validity.invalid || undefined)}
      disabled={disabled}
    >
      {label !== undefined && <Field.Label>{label}</Field.Label>}
      <Control
        {...props}
        options={{ ...options, ...messages, disabled, validate, isDateUnavailable, onFormReset }}
        onValidity={setValidity}
      />
      {description !== undefined && <Field.Description>{description}</Field.Description>}
      <Field.Error>{errorMessage ?? (validity.invalid ? validity.message : undefined)}</Field.Error>
      {children}
    </Field.Root>
  );
}
