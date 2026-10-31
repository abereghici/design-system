import type { ComponentProps } from "react";

import { Wrapper, splitWrapperProps } from "../field/field-wrapper.tsx";
import type { Naming, SizedWrapperProps } from "../field/field-wrapper.tsx";
import type { ChangeEventDetails } from "../field/use-field.ts";
import { Input as TextInput } from "../text-field/text-field-input.tsx";

import fieldStyles from "../field/field.module.css";
import styles from "./otp-field.module.css";

declare module "react" {
  interface CSSProperties {
    "--length"?: number;
  }
}

export type OTPFieldChangeEventDetails = ChangeEventDetails;

export type OTPFieldProps = Naming &
  SizedWrapperProps &
  Omit<
    ComponentProps<typeof TextInput>,
    | "type"
    | "inputMode"
    | "autoComplete"
    | "pattern"
    | "maxLength"
    | "minLength"
    | "size"
    | "dir"
    | "value"
    | "defaultValue"
    | "onValueChange"
    | "aria-label"
    | "aria-labelledby"
  > & {
    /** How many digits the code has. */
    length?: number;
    /** Called as the user types, pastes or autofills the code. */
    onValueChange?: (value: string, details: OTPFieldChangeEventDetails) => void;
  } & ({ value: string; defaultValue?: never } | { value?: never; defaultValue?: string });

/**
 * A one-time code, such as one sent by text message: one input that browsers offer to fill from
 * the message, drawn as a box per digit. Paste, autofill and screen readers treat the code as one
 * value.
 *
 * Tier 1: works before hydration.
 */
export function OTPField({ length = 6, ...props }: OTPFieldProps) {
  const [wrapper, control] = splitWrapperProps(props);

  return (
    <Wrapper {...wrapper}>
      <div
        className={`${fieldStyles["control"]} ${styles["cells"]}`}
        style={{ "--length": length }}
      >
        <TextInput
          {...control}
          className={styles["input"]}
          dir="ltr"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern={`\\d{${length}}`}
          maxLength={length}
        />
      </div>
    </Wrapper>
  );
}
