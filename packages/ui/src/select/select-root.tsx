"use client";

import type { ComponentProps, KeyboardEvent, ReactNode } from "react";

import * as Field from "../field/field.tsx";
import fieldStyles from "../field/field.module.css";
import { ChevronDownIcon } from "../icon/icons/chevron-down.tsx";

import styles from "./select.module.css";

export type ChangeEventDetails = Field.ChangeEventDetails<HTMLSelectElement>;

type Naming =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

type ControlProps = Omit<
  ComponentProps<"select">,
  "multiple" | "size" | "value" | "defaultValue" | "placeholder"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /** Shown until the user chooses; with `required`, choosing nothing fails `valueMissing`. */
  placeholder?: string | undefined;
  /**
   * Renders `aria-disabled="true"`: the select stays focusable and announced, and it neither
   * opens nor changes value. A disabled `<fieldset>` still disables it natively.
   */
  disabled?: boolean;
};

export type RootProps = Naming &
  ControlProps & {
    /** Helper text below the trigger, replaced by the error while invalid. */
    description?: ReactNode;
    /** Shown only after interaction while invalid. Defaults to the browser's `validationMessage`. */
    errorMessage?: ReactNode | ((validity: ValidityState) => ReactNode);
    /** Forces the invalid state, e.g. from an external validation library. */
    invalid?: boolean;
    validate?: Field.RootProps["validate"];
    /** Exposed as `data-size`. Replaces the native `size`, which turns a select into a list box. */
    size?: "md" | "lg";
  };

const blocked = (event: KeyboardEvent) =>
  /^(?:Arrow|Page|Home|End|Enter)/v.test(event.key) ||
  (event.key.length === 1 && !event.ctrlKey && !event.metaKey);

function Control({
  placeholder,
  defaultValue = placeholder === undefined ? undefined : "",
  children,
  ...props
}: ControlProps) {
  const bindings = Field.useFieldControl<HTMLSelectElement, typeof props>(props);
  const disabled = bindings["aria-disabled"] === true;
  return (
    <div className={styles["control"]}>
      <select
        {...bindings}
        defaultValue={props.value === undefined ? defaultValue : undefined}
        className={`${fieldStyles["control"]} ${styles["select"]}`}
        onKeyDown={(event) => {
          if (disabled && blocked(event)) event.preventDefault();
          props.onKeyDown?.(event);
        }}
        onMouseDown={(event) => {
          if (disabled) event.preventDefault();
          props.onMouseDown?.(event);
        }}
      >
        {placeholder !== undefined && (
          <option value="" disabled hidden className={styles["placeholder"]}>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDownIcon size="sm" className={styles["icon"]} />
    </div>
  );
}

/** A native `<select>` with a built-in label, description and error. */
export function Root({
  label,
  description,
  errorMessage,
  invalid,
  validate,
  size = "md",
  className,
  style,
  ...props
}: RootProps) {
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
