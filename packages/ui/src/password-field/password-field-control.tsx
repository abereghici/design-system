"use client";

import type { ComponentProps } from "react";

import { useField } from "../field/use-field.ts";
import type { FormControl } from "../field/use-field.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { useEvent } from "../internal/dom-event/use-event.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";
import { InputGroup } from "../text-field/text-field-input-group.tsx";
import { Input as TextInput } from "../text-field/text-field-input.tsx";
import type { TextFieldProps } from "../text-field/text-field.tsx";

import { Toggle } from "./password-field-toggle.tsx";

/** `cancel()`: keeps the current visibility. */
export type PasswordFieldVisibleChangeEventDetails = Details<"toggle-press" | "form-submit">;

export type ControlProps = Omit<
  ComponentProps<typeof TextInput>,
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

function mask(input: Element) {
  input.setAttribute("type", "password");
}

function useVisibility(
  input: FormControl | null,
  visible: boolean | undefined,
  defaultVisible: boolean | undefined,
  onVisibleChange: ControlProps["onVisibleChange"],
) {
  const [current, change] = useControllableState(visible, defaultVisible ?? false, onVisibleChange);

  useEvent(
    "submit",
    (event) => {
      // The type must switch before the submission reads the form, not on React's next render:
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm
      if (current && change(false, "form-submit", event) && input !== null) mask(input);
    },
    input?.form ?? null,
  );

  return [current, change] as const;
}

/** The password input and its show toggle. */
export function Control({
  visible: controlled,
  defaultVisible,
  onVisibleChange,
  toggleLabel,
  startElement,
  autoComplete = "current-password",
  ...props
}: ControlProps) {
  const { field, blocked } = useField();
  const input = field?.control ?? null;
  const [visible, change] = useVisibility(input, controlled, defaultVisible, onVisibleChange);

  const toggle = (
    <Toggle
      aria-label={toggleLabel}
      aria-controls={field?.controlId}
      pressed={visible}
      disabled={blocked}
      onPressedChange={(next, details) => {
        if (!change(next, "toggle-press", details.event.nativeEvent)) details.cancel();
      }}
      onClick={(event) => {
        if (event.detail > 0) input?.focus();
      }}
    />
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
