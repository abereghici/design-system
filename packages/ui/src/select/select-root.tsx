"use client";

import type { ComponentProps, KeyboardEvent, ReactNode } from "react";

import * as Field from "../field/field.tsx";
import { ChevronDownIcon } from "../icon/icons/chevron-down.tsx";

import fieldStyles from "../field/field.module.css";
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
  /** The chosen value, when your state holds it; pair it with `onValueChange`. */
  value?: string;
  /** The starting value when it holds its own state. */
  defaultValue?: string;
  /** Called when the user chooses an option. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /** The prompt shown until the user chooses, such as "Choose a region". */
  placeholder?: string | undefined;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
};

export type RootProps = Naming &
  ControlProps & {
    /**
     * Helper text under the field, such as a format hint; the error message takes its place while
     * invalid.
     */
    description?: ReactNode;
    /**
     * What to fix, shown once the user has interacted and the value is invalid. Without it the
     * browser's own message is shown.
     */
    errorMessage?: ReactNode | ((validity: ValidityState) => ReactNode);
    /** Marks the value invalid from outside, such as a server or validation library result. */
    invalid?: boolean;
    /** Your own rule: return a message to mark the value invalid, or nothing when it is valid. */
    validate?: Field.RootProps["validate"];
    /** `lg` for prominent or spacious forms. Touch screens get larger targets on their own. */
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

/**
 * Chooses one value from a short, known list (up to about 15 options). Keyboard, typing to jump,
 * autofill and phone pickers work as people expect from any select; browsers that can't style the
 * list show the system one. For a long or searchable list use Combobox; for 2–6 options that should
 * stay visible, RadioGroup.
 */
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
