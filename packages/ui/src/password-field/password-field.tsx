import { Wrapper, splitWrapperProps } from "../field/field-wrapper.tsx";
import type { Naming, SizedWrapperProps } from "../field/field-wrapper.tsx";

import { Control } from "./password-field-control.tsx";
import type { ControlProps } from "./password-field-control.tsx";

export type { PasswordFieldVisibleChangeEventDetails } from "./password-field-control.tsx";

export type PasswordFieldProps = Naming & SizedWrapperProps & ControlProps;

/**
 * A TextField for secrets, with a toggle that shows the password as plain text so users can check
 * what they typed. Use it for sign-in, sign-up and password-change forms.
 *
 * Tier 1: works before hydration, except the show-password toggle (Tier 2), which works after it.
 */
export function PasswordField(props: PasswordFieldProps) {
  const [wrapper, control] = splitWrapperProps(props);

  return (
    <Wrapper {...wrapper}>
      <Control {...control} />
    </Wrapper>
  );
}
