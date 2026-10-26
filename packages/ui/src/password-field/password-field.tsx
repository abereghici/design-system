"use client";

import * as Field from "../field/field.tsx";
import type { TextFieldProps } from "../text-field/text-field.tsx";

import { Control } from "./password-field-control.tsx";
import type { ControlProps } from "./password-field-control.tsx";

export type { PasswordFieldVisibleChangeEventDetails } from "./password-field-control.tsx";

export type PasswordFieldProps = Omit<
  TextFieldProps,
  "type" | "endElement" | "autoComplete" | "onValueChange"
> &
  ControlProps;

/**
 * A TextField for secrets, with a toggle that shows the password as plain text so users can check
 * what they typed. Use it for sign-in, sign-up and password-change forms.
 */
export function PasswordField({
  label,
  description,
  errorMessage,
  invalid,
  validate,
  size = "md",
  className,
  style,
  ...props
}: PasswordFieldProps) {
  return (
    <Field.Root
      className={className}
      style={style}
      data-size={size}
      name={props.name}
      invalid={invalid}
      validate={validate}
      disabled={props.disabled}
    >
      {label !== undefined && <Field.Label>{label}</Field.Label>}
      <Control {...props} />
      {description !== undefined && <Field.Description>{description}</Field.Description>}
      <Field.Error>{errorMessage}</Field.Error>
    </Field.Root>
  );
}
