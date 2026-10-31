"use client";

import { use, useEffect, useId, useState } from "react";
import type { ComponentProps, SyntheticEvent } from "react";

import "@abereghici/tokens/components/field.css";

import { useEvent } from "../events/use-event.ts";
import { FormErrorsContext } from "../form/form.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

import { FieldContext, setValidity } from "./use-field.ts";
import type { FormControl } from "./use-field.ts";
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

type Failure = { readonly message: string; readonly validity: ValidityState } | null;

const failureOf = (target: FormControl): Failure =>
  target.matches(":user-invalid")
    ? { message: target.validationMessage, validity: target.validity }
    : null;

function useServerError(name: string | undefined, control: FormControl | null) {
  const errors = use(FormErrorsContext);
  const [cleared, setCleared] = useState<typeof errors>();
  const server = errors === cleared || name === undefined ? undefined : errors?.[name];

  useEffect(() => {
    if (server === undefined || control === null || errors === undefined) return;

    const first = [...(control.form?.elements ?? [])].find(
      (element) => errors[element.getAttribute("name") ?? ""] !== undefined,
    );

    if (first === control && document.activeElement !== control) control.focus();
  }, [errors, server, control]);

  return {
    server,
    clear: () => {
      setCleared(errors);
    },
  };
}

function useValidity(
  { name, validate }: Pick<RootProps, "name" | "validate">,
  control: FormControl | null,
) {
  const [failure, setFailure] = useState<Failure>(null);
  const { server, clear } = useServerError(name, control);
  const clearServerError = () => {
    setFailure(null);
    clear();
  };

  useEffect(() => {
    if (control !== null) setValidity(control, undefined, server, validate);
  }, [control, server, validate]);

  // React's onChange on a text input is the input event; user validity turns on at the native
  // change: https://react.dev/reference/react-dom/components/input#props
  useEvent(
    "change",
    () => {
      setFailure(control === null ? null : failureOf(control));
    },
    control,
  );
  useEvent("reset", clearServerError, control?.form ?? null);

  const own = (event: SyntheticEvent) => (event.target === control ? control : null);

  return {
    failure,
    serverError: server,
    clearServerError,
    sync: (event: SyntheticEvent) => {
      const target = own(event);

      if (target !== null) setFailure(failureOf(target));
    },
    edit: (event: SyntheticEvent) => {
      const target = own(event);

      if (target === null) return;

      clear();
      setValidity(target, undefined, undefined, validate);
      setFailure(failureOf(target));
    },
  };
}

/**
 * Gives one form control a visible label, a description and an error, and shows the error only
 * after the user has interacted, in place of the description. Use it to build your own control or to
 * add a description and error to Checkbox, Switch, RadioGroup or Slider. TextField, TextArea,
 * PasswordField, SearchField, NumberField and Select already contain one.
 *
 * Tier 1: works before hydration.
 */
export function Root({ name, disabled = false, invalid, validate, ...props }: RootProps) {
  const ids = useId();
  const [control, setControl] = useState<FormControl | null>(null);
  const [register] = useState(() => (node: FormControl | null) => {
    setControl(node);

    return () => {
      setControl((current) => (current === node ? null : current));
    };
  });
  const controlId = control === null || control.id === "" ? `${ids}control` : control.id;
  const { failure, sync, edit, ...server } = useValidity({ name, validate }, control);
  const shown = invalid ?? (server.serverError !== undefined || failure !== null);
  const parts = partIds(ids);
  // Server-rendered, so the control is described before hydration; a missing description is ignored.
  const describedBy = shown ? parts.errorId : parts.descriptionId;
  const message = server.serverError ?? failure?.message;
  const state = { controlId, ...parts, name, disabled, invalid: shown, describedBy };
  const context = { ...state, ...server, message, validity: failure?.validity, control, register };

  return (
    <FieldContext value={context}>
      <div
        {...mergeProps(
          {
            className: styles["root"],
            onChange: edit,
            onBlur: sync,
            onInvalidCapture: sync,
          },
          props,
        )}
        data-invalid={shown ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
      />
    </FieldContext>
  );
}
