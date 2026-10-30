"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { Wrapper } from "../field/field-wrapper.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

import { Control } from "./date-field-control.tsx";
import type { ControlProps } from "./date-field-control.tsx";
import type { DateFieldProps } from "./date-field.tsx";
import type { Validity } from "./use-validity.ts";
import styles from "./date-field.module.css";

export type RootProps = DateFieldProps &
  Pick<ControlProps, "end"> &
  Pick<ControlProps["options"], "isDateUnavailable" | "unavailableMessage" | "onFormReset"> & {
    children?: ReactNode;
  };

/** DateField with a slot in its field box and one after it, for the DatePicker. */
export function Root({
  label,
  description,
  errorMessage,
  invalid,
  size,
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
  incompleteMessage,
  placeholders,
  isDateUnavailable,
  unavailableMessage,
  onFormReset,
  children,
  ...props
}: RootProps) {
  const [validity, setValidity] = useState<Validity>({ invalid: false, message: "" });
  const options = { value, defaultValue, onValueChange, min, max, name, form, required };
  const messages = { incompleteMessage, unavailableMessage, placeholders };

  return (
    <Wrapper
      {...mergeProps({ className: styles["root"] }, { className, style })}
      label={label}
      description={description}
      errorMessage={errorMessage ?? (validity.invalid ? validity.message : undefined)}
      size={size}
      name={name}
      invalid={invalid ?? (validity.invalid || undefined)}
      disabled={disabled}
      after={children}
    >
      <Control
        {...props}
        options={{ ...options, ...messages, disabled, validate, isDateUnavailable, onFormReset }}
        onValidity={setValidity}
      />
    </Wrapper>
  );
}
