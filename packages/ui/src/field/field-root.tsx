"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/field.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import { useFieldValidity } from "./use-field-validity.ts";
import { FieldContext } from "./use-field.ts";
import styles from "./field.module.css";

export interface RootProps extends ComponentProps<"div"> {
  /** The form field name; Form's `errors` uses it to show a server error on this field. */
  name?: string | undefined;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean | undefined;
  /** Marks the value invalid from outside, such as a server or validation library result. */
  invalid?: boolean | undefined;
  /** Your own rule: return a message to mark the value invalid, or nothing when it is valid. */
  validate?: ((value: string, formData: FormData) => string | null | undefined) | undefined;
}

const partIds = (base: string) => ({
  labelId: `${base}label`,
  descriptionId: `${base}description`,
  errorId: `${base}error`,
});

/**
 * Gives one form control a visible label, a description and an error, and shows the error only
 * after the user has interacted, in place of the description. Use it to build your own control or to
 * add a description and error to Checkbox, Switch, RadioGroup or Slider. TextField, TextArea,
 * PasswordField, SearchField, OTPField, NumberField and Select already contain one.
 *
 * Tier 1: works before hydration.
 */
export function Root({ name, disabled = false, invalid, validate, ...props }: RootProps) {
  const ids = useId();
  const { rootProps, serverError, failure, ...field } = useFieldValidity(name, validate);
  const { control } = field;
  const controlId = control === null || control.id === "" ? `${ids}control` : control.id;
  const shown = invalid ?? (serverError !== undefined || failure !== null);
  const parts = partIds(ids);
  // Server-rendered, so the control is described before hydration; a missing description is ignored.
  const describedBy = shown ? parts.errorId : parts.descriptionId;
  const message = serverError ?? failure?.message;
  const state = { controlId, ...parts, name, disabled, invalid: shown, describedBy };
  const context = { ...state, ...field, message, validity: failure?.validity };

  return (
    <FieldContext value={context}>
      <div
        {...mergeProps({ className: styles["root"], ...rootProps }, props)}
        data-invalid={shown ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
      />
    </FieldContext>
  );
}
