"use client";

import { use, useEffect, useState } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { FieldContext } from "../field/field-control.ts";
import * as Field from "../field/field.tsx";
import { IconButton } from "../icon-button/icon-button.tsx";
import { InspectIcon } from "../icon/icons/inspect.tsx";
import { useLocale } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";
import { passwordField as passwordFieldLabels } from "../provider/locales/en-US/password-field.ts";
import { InputGroup, TextInput } from "../text-field/text-field.tsx";
import type { TextFieldProps } from "../text-field/text-field.tsx";

/** `cancel()`: keeps the current visibility. */
export type PasswordFieldVisibleChangeEventDetails = Details<"toggle-press" | "form-submit">;

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
    const accepted = requestChange(onVisibleChange, next, reason, event);
    if (accepted) setOwn(next);
    return accepted;
  };
  useEffect(() => {
    const input = inputOf(inputId);
    const form = input?.form;
    const hide = (event: Event) => {
      // The type must switch before the submission reads the form, not on React's next render.
      if (current && change(false, "form-submit", event) && input !== null) input.type = "password";
    };
    const controller = new AbortController();
    form?.addEventListener("submit", hide, { signal: controller.signal });
    return () => {
      controller.abort();
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
      aria-label={labels?.show ?? locale.labels.passwordField?.show ?? passwordFieldLabels.show}
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
