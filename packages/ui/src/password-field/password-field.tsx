"use client";

import { use, useEffect, useState } from "react";

import { FieldContext } from "../field/field-root.tsx";
import * as Field from "../field/field.tsx";
import { InspectIcon } from "../icon/icons/inspect.tsx";
import { IconButton } from "../icon-button/icon-button.tsx";
import { useLocale } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";
import { InputGroup, TextInput } from "../text-field/text-field.tsx";
import type { TextFieldProps } from "../text-field/text-field.tsx";

export interface PasswordFieldVisibleChangeEventDetails {
  readonly reason: "toggle-press" | "form-submit";
  readonly event: Event;
  /** Keeps the current visibility. */
  readonly cancel: () => void;
}

type ControlProps = Omit<
  Field.ControlProps,
  "type" | "autoComplete" | "size" | "aria-label" | "aria-labelledby"
> & {
  /** Controlled: whether the value is shown as plain text. */
  visible?: boolean;
  defaultVisible?: boolean;
  /** Called before the change commits. Submitting the form hides it with `reason: "form-submit"`. */
  onVisibleChange?: (visible: boolean, details: PasswordFieldVisibleChangeEventDetails) => void;
  /** The toggle's accessible name; falls back to the Provider's locale. */
  labels?: Partial<Labels["passwordField"]>;
  autoComplete?: "current-password" | "new-password" | "one-time-code" | "off";
  startElement?: TextFieldProps["startElement"];
};

export type PasswordFieldProps = Omit<
  TextFieldProps,
  "type" | "endElement" | "autoComplete" | "onValueChange"
> &
  ControlProps;

type Reason = PasswordFieldVisibleChangeEventDetails["reason"];

const inputOf = (id: string | undefined) =>
  id === undefined ? null : document.querySelector<HTMLInputElement>(`#${CSS.escape(id)}`);

function useVisibility(
  inputId: string | undefined,
  visible: boolean | undefined,
  defaultVisible: boolean | undefined,
  onVisibleChange: ControlProps["onVisibleChange"],
) {
  const [own, setOwn] = useState(defaultVisible ?? false);
  const current = visible ?? own;
  const change = (next: boolean, reason: Reason, event: Event) => {
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    onVisibleChange?.(next, { reason, event, cancel });
    if (!cancelled) setOwn(next);
    return !cancelled;
  };
  useEffect(() => {
    const input = inputOf(inputId);
    const form = input?.form;
    const hide = (event: Event) => {
      // The type must switch before the submission reads the form, not on React's next render.
      if (current && change(false, "form-submit", event) && input !== null) input.type = "password";
    };
    form?.addEventListener("submit", hide);
    return () => {
      form?.removeEventListener("submit", hide);
    };
  });
  return [current, change] as const;
}

function Control({
  visible: controlled,
  defaultVisible,
  onVisibleChange,
  labels,
  startElement,
  autoComplete = "current-password",
  ...props
}: ControlProps) {
  const field = use(FieldContext);
  const locale = useLocale();
  const inputId = field?.controlId;
  const [visible, change] = useVisibility(inputId, controlled, defaultVisible, onVisibleChange);

  const toggle = (
    <IconButton
      size="sm"
      aria-label={labels?.show ?? locale.labels.passwordField.show}
      aria-controls={inputId}
      pressed={visible}
      disabled={field?.disabled === true}
      onPressedChange={(next, details) => {
        if (!change(next, "toggle-press", details.event.nativeEvent)) details.cancel();
      }}
      onClick={(event) => {
        if (event.detail > 0) inputOf(inputId)?.focus();
      }}
    >
      <InspectIcon size="sm" />
    </IconButton>
  );

  return (
    <InputGroup start={startElement} end={toggle}>
      <TextInput
        {...props}
        type={visible ? "text" : "password"}
        dir={visible ? "auto" : undefined}
        autoComplete={autoComplete}
      />
    </InputGroup>
  );
}

/** A TextField for secrets, with a toggle that shows the password so users can check it. */
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
