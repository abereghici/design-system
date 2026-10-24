"use client";

import { use, useEffect, useId, useState } from "react";
import type { ComponentProps, SyntheticEvent } from "react";

import { FormErrorsContext } from "../form/form.tsx";

import { FieldContext } from "./field-control.ts";
import type { FormControl } from "./field-control.ts";
import styles from "./field.module.css";

export const withClass = (base: string | undefined, className: string | undefined) =>
  className === undefined ? base : `${base} ${className}`;

export interface RootProps extends ComponentProps<"div"> {
  /** Passed to the control's `name`; also the key Form's `errors` uses for this field. */
  name?: string | undefined;
  /**
   * Passed to the control, which renders `aria-disabled="true"`: focusable, announced, not
   * editable. A disabled Fieldset disables the control natively instead.
   */
  disabled?: boolean | undefined;
  /** Forces the invalid state (an external validation library); wins over native validity. */
  invalid?: boolean | undefined;
  /** Custom rule run on every change; a string becomes the `setCustomValidity()` message. */
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

const controlOf = (id: string) => {
  const element = document.querySelector(`#${CSS.escape(id)}`);
  return element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
    ? element
    : null;
};

const applyRule = (
  target: FormControl,
  message: string | undefined,
  rule: RootProps["validate"],
) => {
  target.setCustomValidity(
    message ?? rule?.(target.value, new FormData(target.form ?? undefined)) ?? "",
  );
};

function useServerError(name: string | undefined, controlId: string) {
  const errors = use(FormErrorsContext);
  const [cleared, setCleared] = useState<typeof errors>();
  const server = errors === cleared || name === undefined ? undefined : errors?.[name];
  useEffect(() => {
    const target = controlOf(controlId);
    if (server === undefined || target === null || errors === undefined) return;
    const first = Array.from(target.form?.elements ?? []).find(
      (element) => errors[element.getAttribute("name") ?? ""] !== undefined,
    );
    if (first === target && document.activeElement !== target) target.focus();
  }, [errors, server, controlId]);
  return {
    server,
    clear: () => {
      setCleared(errors);
    },
  };
}

function useValidity({ name, validate }: Pick<RootProps, "name" | "validate">, controlId: string) {
  const [failure, setFailure] = useState<Failure>(null);
  const { server, clear } = useServerError(name, controlId);

  useEffect(() => {
    const target = controlOf(controlId);
    if (target !== null) applyRule(target, server, validate);
  }, [controlId, server, validate]);

  useEffect(() => {
    const target = controlOf(controlId);
    const form = target?.form;
    const commit = () => {
      setFailure(target === null ? null : failureOf(target));
    };
    const reset = () => {
      setFailure(null);
      clear();
    };
    // React's onChange on a text input is the input event; user validity turns on at the native change.
    target?.addEventListener("change", commit);
    form?.addEventListener("reset", reset);
    return () => {
      target?.removeEventListener("change", commit);
      form?.removeEventListener("reset", reset);
    };
  });

  const own = (event: SyntheticEvent) => {
    const target = controlOf(controlId);
    return event.target === target ? target : null;
  };
  return {
    failure,
    server,
    sync: (event: SyntheticEvent) => {
      const target = own(event);
      if (target !== null) setFailure(failureOf(target));
    },
    edit: (event: SyntheticEvent) => {
      const target = own(event);
      if (target === null) return;
      clear();
      applyRule(target, undefined, validate);
      setFailure(failureOf(target));
    },
  };
}

/**
 * Wires one form control to a visible label, a description and an error, and shows the error only
 * after interaction (`:user-invalid`), in place of the description. Use it to compose your own
 * control or to add a description and error to Checkbox, Switch, RadioGroup or Slider. TextField,
 * TextArea, PasswordField, NumberField and Select already contain a Field.
 */
export function Root({
  name,
  disabled = false,
  invalid,
  validate,
  className,
  onChange,
  onBlur,
  onInvalidCapture,
  ...props
}: RootProps) {
  const ids = useId();
  const [controlId, setControlId] = useState(`${ids}control`);
  const [described, describe] = useState(false);
  const { failure, server, sync, edit } = useValidity({ name, validate }, controlId);
  const shown = invalid ?? (server !== undefined || failure !== null);
  const parts = partIds(ids);
  const describedBy = shown ? parts.errorId : described ? parts.descriptionId : undefined;
  const message = server ?? failure?.message;
  const state = { controlId, ...parts, name, disabled, invalid: shown, describedBy };

  return (
    <FieldContext
      value={{ ...state, message, validity: failure?.validity, setControlId, describe }}
    >
      <div
        {...props}
        className={withClass(styles["root"], className)}
        data-invalid={shown || undefined}
        data-disabled={disabled || undefined}
        onChange={(event) => {
          onChange?.(event);
          edit(event);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          sync(event);
        }}
        onInvalidCapture={(event) => {
          onInvalidCapture?.(event);
          sync(event);
        }}
      />
    </FieldContext>
  );
}
