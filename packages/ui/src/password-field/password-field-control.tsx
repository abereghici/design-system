import { useState } from "react";
import type { ComponentProps } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useEvent } from "../events/use-event.ts";
import { useField } from "../field/use-field.ts";
import type { FormControl } from "../field/use-field.ts";
import { IconButton } from "../icon-button/icon-button.tsx";
import { EyeOffIcon } from "../icon/icons/eye-off.tsx";
import { EyeIcon } from "../icon/icons/eye.tsx";
import { InputGroup, TextInput } from "../text-field/text-field.tsx";
import type { TextFieldProps } from "../text-field/text-field.tsx";
import { useLabels } from "../ui-provider/locale.tsx";
import type { Labels } from "../ui-provider/locale.tsx";
import { passwordField as passwordFieldLabels } from "../ui-provider/locales/en-US/password-field.ts";

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
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: Partial<Labels["passwordField"]>;
  /**
   * Tells password managers what to fill: `current-password` to sign in, `new-password` to sign up
   * or change it.
   */
  autoComplete?: "current-password" | "new-password" | "one-time-code" | "off";
  /** Content before the input, such as a decorative icon. */
  startElement?: TextFieldProps["startElement"];
};

type Reason = PasswordFieldVisibleChangeEventDetails["reason"];

function mask(input: Element) {
  input.setAttribute("type", "password");
}

function useVisibility(
  input: FormControl | null,
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
  useEvent(
    "submit",
    (event) => {
      // The type must switch before the submission reads the form, not on React's next render.
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
  labels,
  startElement,
  autoComplete = "current-password",
  ...props
}: ControlProps) {
  const { field, blocked } = useField();
  const input = field?.control ?? null;
  const [visible, change] = useVisibility(input, controlled, defaultVisible, onVisibleChange);

  const toggle = (
    <IconButton
      size="sm"
      aria-label={useLabels("passwordField", passwordFieldLabels, labels).show}
      aria-controls={field?.controlId}
      pressed={visible}
      disabled={blocked}
      onPressedChange={(next, details) => {
        if (!change(next, "toggle-press", details.event.nativeEvent)) details.cancel();
      }}
      onClick={(event) => {
        if (event.detail > 0) input?.focus();
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
