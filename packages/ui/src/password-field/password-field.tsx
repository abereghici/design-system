"use client";

import { Frame, splitFrame } from "../field/field-frame.tsx";
import type { Naming, SizedFrameProps } from "../field/field-frame.tsx";

import { Control } from "./password-field-control.tsx";
import type { ControlProps } from "./password-field-control.tsx";

export type { PasswordFieldVisibleChangeEventDetails } from "./password-field-control.tsx";

export type PasswordFieldProps = Naming & SizedFrameProps & ControlProps;

/**
 * A TextField for secrets, with a toggle that shows the password as plain text so users can check
 * what they typed. Use it for sign-in, sign-up and password-change forms.
 */
export function PasswordField(props: PasswordFieldProps) {
  const [frame, control] = splitFrame(props);

  return (
    <Frame {...frame}>
      <Control {...control} />
    </Frame>
  );
}
