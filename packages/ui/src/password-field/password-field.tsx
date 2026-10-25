"use client";

import { useEffect, useState } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import * as Field from "../field/field.tsx";
import { useField } from "../field/use-field.ts";
import { IconButton } from "../icon-button/icon-button.tsx";
import { EyeOffIcon } from "../icon/icons/eye-off.tsx";
import { EyeIcon } from "../icon/icons/eye.tsx";
import { InputGroup, TextInput } from "../text-field/text-field.tsx";
import type { TextFieldProps } from "../text-field/text-field.tsx";

/** `cancel()`: keeps the current visibility. */
export type PasswordFieldVisibleChangeEventDetails = Details<"toggle-press" | "form-submit">;

type ControlProps = Omit<
  Field.ControlProps,
  "type" | "autoComplete" | "size" | "aria-label" | "aria-labelledby"
> & {
  /** Shows the password as plain text, when your state holds it. */
  visible?: boolean;
  /** Shows the password as plain text on the first render. */
  defaultVisible?: boolean;
  /**
   * Called before the password shows or hides. Submitting the form hides it, so the browser never
   * saves it shown.
   */
  onVisibleChange?: (visible: boolean, details: PasswordFieldVisibleChangeEventDetails) => void;
  /** The name of the show-password toggle, such as "Show password": it shows only an icon. */
  toggleLabel: string;
  /**
   * Tells password managers what to fill: `current-password` to sign in, `new-password` to sign up
   * or change it.
   */
  autoComplete?: "current-password" | "new-password" | "one-time-code" | "off";
  /** Content before the input, such as a decorative icon. */
  startElement?: TextFieldProps["startElement"];
};

export type PasswordFieldProps = Omit<
  TextFieldProps,
  "type" | "endElement" | "autoComplete" | "onValueChange"
> &
  ControlProps;

type Reason = PasswordFieldVisibleChangeEventDetails["reason"];

function inputOf(id: string | undefined) {
  const node = id === undefined ? null : document.getElementById(id);
  return node instanceof HTMLInputElement ? node : null;
}

function useVisibility(
  inputId: string | undefined,
  visible: boolean | undefined,
  defaultVisible: boolean | undefined,
  onVisibleChange: ControlProps["onVisibleChange"],
) {
  const [uncontrolled, setUncontrolled] = useState(defaultVisible ?? false);
  const current = visible ?? uncontrolled;
  const change = (next: boolean, reason: Reason, event: Event) => {
    const accepted = requestChange(onVisibleChange, next, reason, event);
    if (accepted) setUncontrolled(next);
    return accepted;
  };
  useEffect(() => {
    const input = inputOf(inputId);
    const form = input?.form;
    const hide = (event: Event) => {
      // The type must switch before the submission reads the form, not on React's next render:
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm
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
  toggleLabel,
  startElement,
  autoComplete = "current-password",
  ...props
}: ControlProps) {
  const { field, blocked } = useField();
  const inputId = field?.controlId;
  const [visible, change] = useVisibility(inputId, controlled, defaultVisible, onVisibleChange);

  const toggle = (
    <IconButton
      size="sm"
      aria-label={toggleLabel}
      aria-controls={inputId}
      pressed={visible}
      disabled={blocked}
      onPressedChange={(next, details) => {
        if (!change(next, "toggle-press", details.event.nativeEvent)) details.cancel();
      }}
      onClick={(event) => {
        if (event.detail > 0) inputOf(inputId)?.focus();
      }}
    >
      {visible ? <EyeIcon size="sm" /> : <EyeOffIcon size="sm" />}
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
