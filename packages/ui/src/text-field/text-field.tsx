"use client";

import type { ComponentProps, ReactNode } from "react";

import { Frame, splitFrame } from "../field/field-frame.tsx";
import type { Naming, SizedFrameProps } from "../field/field-frame.tsx";
import * as Field from "../field/field.tsx";

import fieldStyles from "../field/field.module.css";
import styles from "./text-field.module.css";

export type TextFieldChangeEventDetails = Field.ChangeEventDetails;

export type TextFieldProps = Naming &
  SizedFrameProps &
  Omit<ComponentProps<"input">, "size"> & {
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
export function TextField({ startElement, endElement, ...props }: TextFieldProps) {
  const [frame, control] = splitFrame(props);

  return (
    <Frame {...frame}>
      <InputGroup start={startElement} end={endElement}>
        <TextInput {...control} />
      </InputGroup>
    </Frame>
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
