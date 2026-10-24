"use client";

import { useId, useRef, useState } from "react";
import type {
  ChangeEvent,
  ComponentProps,
  FocusEvent,
  KeyboardEvent,
  ReactNode,
  SyntheticEvent,
} from "react";

import { ChevronDownIcon } from "../icon/icons/chevron-down.tsx";

import styles from "./select.module.css";

export interface ChangeEventDetails {
  readonly reason: "none";
  readonly event: ChangeEvent<HTMLSelectElement>;
  /** Restores the previous value. */
  readonly cancel: () => void;
}

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
  /** Custom rule run on every change; a string becomes the `setCustomValidity()` message. */
  validate?: (value: string, formData: FormData) => string | null | undefined;
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
    /** Exposed as `data-size`. Replaces the native `size`, which turns a select into a list box. */
    size?: "md" | "lg";
  };

type Failure = { readonly message: string; readonly validity: ValidityState } | null;

const blocked = (event: KeyboardEvent) =>
  /^(?:Arrow|Page|Home|End|Enter)/v.test(event.key) ||
  (event.key.length === 1 && !event.ctrlKey && !event.metaKey);

function changeEventDetails(
  event: ChangeEvent<HTMLSelectElement>,
): [ChangeEventDetails, () => boolean] {
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  return [{ reason: "none", event, cancel }, () => cancelled];
}

type ChangeOptions = {
  [Key in "validate" | "onValueChange" | "onChange" | "onFocus"]: ControlProps[Key] | undefined;
} & { disabled: boolean };

function useChange({ disabled, validate, onValueChange, onChange, onFocus }: ChangeOptions) {
  const previous = useRef("");
  return {
    onFocus(event: FocusEvent<HTMLSelectElement>) {
      previous.current = event.currentTarget.value;
      onFocus?.(event);
    },
    onChange(event: ChangeEvent<HTMLSelectElement>) {
      const select = event.currentTarget;
      if (disabled) {
        select.value = previous.current;
        return;
      }
      onChange?.(event);
      const [details, cancelled] = changeEventDetails(event);
      onValueChange?.(select.value, details);
      if (cancelled()) select.value = previous.current;
      previous.current = select.value;
      const rule = validate?.(select.value, new FormData(select.form ?? undefined));
      if (validate !== undefined) select.setCustomValidity(rule ?? "");
    },
  };
}

function Control({
  placeholder,
  defaultValue = placeholder === undefined ? undefined : "",
  validate,
  disabled = false,
  onValueChange,
  onChange,
  onFocus,
  children,
  ...props
}: ControlProps) {
  return (
    <div className={styles["control"]}>
      <select
        {...props}
        {...useChange({ disabled, validate, onValueChange, onChange, onFocus })}
        defaultValue={props.value === undefined ? defaultValue : undefined}
        aria-disabled={disabled || undefined}
        className={styles["select"]}
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
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDownIcon size="sm" className={styles["icon"]} />
    </div>
  );
}

const messageOf = (errorMessage: RootProps["errorMessage"], failure: Failure) =>
  typeof errorMessage === "function"
    ? failure !== null && errorMessage(failure.validity)
    : (errorMessage ?? failure?.message);

function Messages({
  ids,
  shown,
  description,
  message,
}: {
  ids: string;
  shown: boolean;
  description: ReactNode;
  message: ReactNode;
}) {
  return (
    <>
      {description !== undefined && (
        <p id={`${ids}description`} className={styles["description"]} hidden={shown}>
          {description}
        </p>
      )}
      <div id={`${ids}error`} className={styles["error"]} aria-live="assertive">
        {shown ? message : null}
      </div>
    </>
  );
}

function useFailure() {
  const [failure, setFailure] = useState<Failure>(null);
  const sync = ({ target }: SyntheticEvent) => {
    if (!(target instanceof HTMLSelectElement)) return;
    const userInvalid = target.matches(":user-invalid");
    setFailure(
      userInvalid ? { message: target.validationMessage, validity: target.validity } : null,
    );
  };
  return [failure, sync] as const;
}

/**
 * Chooses one value from a short, known list (up to about 15 options). It is a native `<select>`:
 * keyboard, typeahead, screen readers, autofill, mobile pickers and form submission are the
 * platform's. Engines with customizable select draw the brand picker; the others show the operating
 * system's. For a long or searchable list use Combobox; for 2–6 options that should stay visible,
 * RadioGroup.
 */
export function Root({
  label,
  description,
  errorMessage,
  invalid,
  size = "md",
  className,
  style,
  id,
  ...props
}: RootProps) {
  const ids = useId();
  const [failure, sync] = useFailure();
  const shown = invalid ?? failure !== null;

  return (
    <div
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
      style={style}
      data-size={size}
      data-invalid={shown || undefined}
      data-disabled={props.disabled === true || undefined}
      onChange={sync}
      onBlur={sync}
      onInvalid={sync}
    >
      {label !== undefined && (
        <label htmlFor={id ?? `${ids}select`} className={styles["label"]}>
          {label}
        </label>
      )}
      <Control
        {...props}
        id={id ?? `${ids}select`}
        aria-invalid={shown || undefined}
        aria-describedby={
          shown ? `${ids}error` : description === undefined ? undefined : `${ids}description`
        }
      />
      <Messages
        ids={ids}
        shown={shown}
        description={description}
        message={messageOf(errorMessage, failure)}
      />
    </div>
  );
}
