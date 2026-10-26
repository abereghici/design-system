"use client";

import type { ComponentProps, ReactNode } from "react";

import * as Field from "../field/field.tsx";

import fieldStyles from "../field/field.module.css";
import styles from "./text-area.module.css";

export type TextAreaChangeEventDetails = Field.ChangeEventDetails<HTMLTextAreaElement>;

type Naming =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

type ControlProps = Omit<ComponentProps<"textarea">, "rows" | "cols"> & {
  /** The height, in lines, it starts at. */
  minRows?: number;
  /**
   * The height, in lines, it grows to before the text scrolls. Equal to `minRows` for a fixed
   * height.
   */
  maxRows?: number;
  /** Called as the user types, with the new text. */
  onValueChange?: (value: string, details: TextAreaChangeEventDetails) => void;
  /**
   * Stops editing but keeps the text focusable and selectable, so it can still be read and copied.
   */
  disabled?: boolean;
};

export type TextAreaProps = Naming &
  ControlProps & {
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
  };

const lines = (rows: number) =>
  `calc(${rows}lh + 2 * var(--ab-input-padding-block) + 2 * var(--ab-input-border-width))`;

function Control({ minRows = 3, maxRows = 12, readOnly, ...props }: ControlProps) {
  const bindings = Field.useFieldControl<HTMLTextAreaElement, typeof props>(props);
  return (
    <textarea
      dir="auto"
      {...bindings}
      readOnly={bindings["aria-disabled"] ?? readOnly}
      className={`${fieldStyles["control"]} ${styles["textarea"]}`}
      style={{ minBlockSize: lines(minRows), maxBlockSize: lines(maxRows) }}
    />
  );
}

/**
 * Text that may run over several lines, such as a comment. It grows with its content, then scrolls.
 * Use TextField for a single line.
 */
export function TextArea({
  label,
  description,
  errorMessage,
  invalid,
  validate,
  className,
  style,
  ...props
}: TextAreaProps) {
  return (
    <Field.Root
      className={className}
      style={style}
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
