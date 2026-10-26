"use client";

import type { ComponentProps, ReactNode } from "react";

import * as Field from "../field/field.tsx";

import fieldStyles from "../field/field.module.css";
import styles from "./text-field.module.css";

export type TextFieldChangeEventDetails = Field.ChangeEventDetails;

type Naming =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

export type TextFieldProps = Naming &
  Omit<ComponentProps<"input">, "size"> & {
    /**
     * Helper text under the field, such as a format hint; the error message takes its place while
     * invalid.
     */
    description?: ReactNode;
    /**
     * What to fix, shown once the user has interacted and the value is invalid. Without it the
     * browser's own message is shown.
     */
    errorMessage?: ReactNode | ((validity: ValidityState) => ReactNode);
    /** Marks the value invalid from outside, such as a server or validation library result. */
    invalid?: boolean;
    /** Your own rule: return a message to mark the value invalid, or nothing when it is valid. */
    validate?: Field.RootProps["validate"];
    /** `lg` for prominent or spacious forms. Touch screens get larger targets on their own. */
    size?: "md" | "lg";
    /** Content before the input, such as a decorative search icon. */
    startElement?: ReactNode;
    /** Content after the input, such as a Clear IconButton or a shortcut hint. */
    endElement?: ReactNode;
    /** Called as the user types, with the new text. */
    onValueChange?: (value: string, details: TextFieldChangeEventDetails) => void;
    /**
     * Stops editing but keeps the text focusable and selectable, so it can still be read and
     * copied.
     */
    disabled?: boolean;
  };

/**
 * One line of text, with a visible label, an optional description and an error that appears only
 * after the user has interacted. Use TextArea for more than one line, PasswordField for secrets,
 * NumberField for numbers and Select to choose from a short known list.
 */
export function TextField({
  label,
  description,
  errorMessage,
  invalid,
  validate,
  size = "md",
  startElement,
  endElement,
  className,
  style,
  ...props
}: TextFieldProps) {
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
      <InputGroup start={startElement} end={endElement}>
        <TextInput {...props} />
      </InputGroup>
      {description !== undefined && <Field.Description>{description}</Field.Description>}
      <Field.Error>{errorMessage}</Field.Error>
    </Field.Root>
  );
}

/** The field's box, around an input and the content before and after it. */
export function InputGroup({
  start,
  end,
  children,
  onPointerDown,
  ...props
}: ComponentProps<"div"> & { start: ReactNode; end: ReactNode }) {
  return (
    <div
      {...props}
      className={`${fieldStyles["control"]} ${styles["group"]}`}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        const input = event.currentTarget.querySelector("input");
        if (!(event.target instanceof Element) || input === null || event.target === input) return;
        if (event.target.closest("button, a, [tabindex]") !== null) return;
        event.preventDefault();
        input.focus();
      }}
    >
      {start !== undefined && <span className={styles["start"]}>{start}</span>}
      {children}
      {end !== undefined && <span className={styles["end"]}>{end}</span>}
    </div>
  );
}

export function TextInput({ readOnly, ...props }: Field.ControlProps) {
  const bindings = Field.useFieldControl<HTMLInputElement, typeof props>(props);
  return (
    <input
      dir="auto"
      {...bindings}
      readOnly={bindings["aria-disabled"] ?? readOnly}
      className={styles["input"]}
    />
  );
}
