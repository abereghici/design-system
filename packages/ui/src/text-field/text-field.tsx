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
    /** Helper text below the field, replaced by the error while invalid. */
    description?: ReactNode;
    /** Shown only after interaction while invalid. Defaults to the browser's `validationMessage`. */
    errorMessage?: ReactNode | ((validity: ValidityState) => ReactNode);
    /** Forces the invalid state, e.g. from an external validation library. */
    invalid?: boolean;
    validate?: Field.RootProps["validate"];
    /** Heights 32 / 40, growing on coarse pointers. Replaces the native character-width `size`. */
    size?: "md" | "lg";
    /** Content at the inline start, such as a decorative icon. */
    startElement?: ReactNode;
    /** Content at the inline end, such as an `aria-hidden` Kbd or an IconButton. */
    endElement?: ReactNode;
    onValueChange?: (value: string, details: TextFieldChangeEventDetails) => void;
    /** Renders `aria-disabled="true"` and `readOnly`: focusable and selectable, not editable. */
    disabled?: boolean;
  };

/**
 * Single-line text entry with a visible label, an optional description and an inline error that
 * appears only after interaction. Use TextArea for more than one line, PasswordField for secrets,
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

/** The bordered container that draws the field around an input and its start and end content. */
export function InputGroup({
  start,
  end,
  children,
}: {
  start: ReactNode;
  end: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`${fieldStyles["control"]} ${styles["group"]}`}
      onPointerDown={(event) => {
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
