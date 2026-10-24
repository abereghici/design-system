"use client";

import { use, useState } from "react";
import type { ComponentProps, KeyboardEvent, ReactNode, SyntheticEvent } from "react";

import { FieldContext } from "../field/field-root.tsx";
import * as Field from "../field/field.tsx";
import { MinusIcon } from "../icon/icons/minus.tsx";
import { PlusIcon } from "../icon/icons/plus.tsx";
import { IconButton } from "../icon-button/icon-button.tsx";
import { useLocale } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";
import { InputGroup } from "../text-field/text-field.tsx";
import textFieldStyles from "../text-field/text-field.module.css";

import styles from "./number-field.module.css";

export interface NumberFieldChangeEventDetails {
  readonly reason: "input-commit" | "increment-press" | "decrement-press" | "keyboard";
  readonly event: SyntheticEvent;
  /** Keeps the previous value. */
  readonly cancel: () => void;
}

type Naming =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

type Bounds = { min?: number | undefined; max?: number | undefined; step: number };

type ControlProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "size" | "min" | "max" | "step" | "aria-label" | "aria-labelledby"
> & {
  /** Controlled raw value; `null` is empty. */
  value?: number | null | undefined;
  defaultValue?: number | null | undefined;
  /** Called when a value commits: blur or Enter after typing, a step button, an arrow key. */
  onValueChange?: ((value: number | null, details: NumberFieldChangeEventDetails) => void) | undefined;
  /** A committed value is clamped to `min` and `max`. */
  min?: number | undefined;
  max?: number | undefined;
  /** Arrow keys and step buttons move by `step`; a committed value snaps to `min + n × step`. */
  step?: number;
  /** Page Up / Page Down and Shift+Arrow. Defaults to 10 × `step`. */
  largeStep?: number;
  /** How the value is displayed and parsed. */
  formatOptions?: Intl.NumberFormatOptions | undefined;
  /** Defaults to the Provider's locale. */
  locale?: string | undefined;
  /** Step button names; fall back to the Provider's locale. */
  labels?: Partial<Labels["numberField"]>;
  startElement?: ReactNode;
  /** Renders `aria-disabled="true"` and `readOnly`, and disables the step buttons. */
  disabled?: boolean;
};

export type NumberFieldProps = Naming &
  ControlProps & {
    /** Helper text below the field, replaced by the error while invalid. */
    description?: ReactNode;
    /** Shown only after interaction while invalid. Defaults to the browser's `validationMessage`. */
    errorMessage?: ReactNode | ((validity: ValidityState) => ReactNode);
    /** Forces the invalid state, e.g. from an external validation library. */
    invalid?: boolean;
    validate?: Field.RootProps["validate"];
    /** Heights 32 / 40, growing on coarse pointers. */
    size?: "md" | "lg";
  };

function numberFormat(locale: string, options: Intl.NumberFormatOptions | undefined) {
  const format = new Intl.NumberFormat(locale, options);
  const parts = format.formatToParts(-1234567.89);
  const symbol = (type: Intl.NumberFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  const digits = Array.from({ length: 10 }, (_, digit) =>
    new Intl.NumberFormat(locale, { useGrouping: false }).format(digit),
  );
  const parse = (text: string) => {
    let raw = "";
    for (const char of text) {
      const digit = digits.indexOf(char);
      if (digit !== -1) raw += String(digit);
      else if (char === symbol("decimal")) raw += ".";
      else if (char === "-" || char === symbol("minusSign")) raw += "-";
    }
    if (raw === "") return text.trim() === "" ? null : Number.NaN;
    const value = Number(raw);
    return options?.style === "percent" ? value / 100 : value;
  };
  return { format: (value: number) => format.format(value), parse };
}

const decimals = (value: number) => (String(value).split(".")[1] ?? "").length;

function fit(value: number, { min, max, step }: Bounds) {
  const base = min ?? 0;
  const snapped = base + Math.round((value - base) / step) * step;
  const rounded = Number(snapped.toFixed(Math.max(decimals(step), decimals(base))));
  return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, rounded));
}

function stepKey(event: KeyboardEvent, step: number, largeStep: number, { min, max }: Bounds) {
  const large = event.shiftKey ? largeStep : step;
  const deltas: Record<string, number> = { ArrowUp: large, ArrowDown: -large, PageUp: largeStep, PageDown: -largeStep };
  if (event.key in deltas) return (value: number) => value + (deltas[event.key] ?? 0);
  if (event.key === "Home" && min !== undefined) return () => min;
  if (event.key === "End" && max !== undefined) return () => max;
  return null;
}

type Reason = NumberFieldChangeEventDetails["reason"];

function useNumber({
  value,
  defaultValue = null,
  onValueChange,
}: Pick<ControlProps, "value" | "defaultValue" | "onValueChange">) {
  const [own, setOwn] = useState(defaultValue);
  const [text, setText] = useState<string | null>(null);
  const committed = value === undefined ? own : value;
  const commit = (next: number | null, reason: Reason, event: SyntheticEvent) => {
    setText(null);
    if (next === committed) return;
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    onValueChange?.(next, { reason, event, cancel });
    if (!cancelled) setOwn(next);
  };
  return { committed, text, setText, commit };
}

type Direction = 1 | -1;

function StepButtons({
  labels,
  controls,
  disabled,
  onStep,
}: {
  labels: ControlProps["labels"];
  controls: string | undefined;
  disabled: (direction: Direction) => boolean;
  onStep: (direction: Direction, event: SyntheticEvent) => void;
}) {
  const names = { ...useLocale().labels.numberField, ...labels };
  return ([-1, 1] as const).map((direction) => (
    <IconButton
      key={direction}
      size="sm"
      tabIndex={-1}
      aria-label={direction === 1 ? names.increment : names.decrement}
      aria-controls={controls}
      disabled={disabled(direction)}
      onPointerDown={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        onStep(direction, event);
      }}
    >
      {direction === 1 ? <PlusIcon size="sm" /> : <MinusIcon size="sm" />}
    </IconButton>
  ));
}

function useNumberValue({
  value,
  defaultValue,
  onValueChange,
  formatOptions,
  locale,
  min,
  max,
  step = 1,
  largeStep = step * 10,
  ...rest
}: Omit<ControlProps, "labels" | "startElement" | "readOnly">) {
  const app = useLocale();
  const { format, parse } = numberFormat(locale ?? app.tag, formatOptions);
  const { committed, text, setText, commit } = useNumber({ value, defaultValue, onValueChange });
  const bounds = { min, max, step };
  const current = () => {
    const parsed = text === null ? committed : parse(text);
    return parsed !== null && Number.isNaN(parsed) ? committed : parsed;
  };
  const settle = (next: number | null, reason: Reason, event: SyntheticEvent) => {
    commit(next === null ? null : fit(next, bounds), reason, event);
  };
  return {
    rest,
    inputMode: Number.isInteger(step) && (min ?? -1) >= 0 ? ("numeric" as const) : ("decimal" as const),
    committed,
    display: text ?? (committed === null ? "" : format(committed)),
    setText,
    atBound: (direction: Direction) =>
      committed !== null && committed === (direction === 1 ? max : min),
    step: (direction: Direction, event: SyntheticEvent) => {
      const reason = direction === 1 ? "increment-press" : "decrement-press";
      settle((current() ?? min ?? 0) + direction * step, reason, event);
    },
    commitTyped: (event: SyntheticEvent) => {
      settle(current(), "input-commit", event);
    },
    keyStep: (event: KeyboardEvent) => {
      const to = stepKey(event, step, largeStep, bounds);
      if (to === null) return;
      event.preventDefault();
      settle(to(current() ?? min ?? 0), "keyboard", event);
    },
  };
}

function Control({ labels, startElement, readOnly, ...options }: ControlProps) {
  const field = use(FieldContext);
  const { rest: props, ...number } = useNumberValue(options);
  const bindings = Field.useFieldControl<HTMLInputElement, typeof props>({
    ...props,
    onChange: (event) => {
      number.setText(event.currentTarget.value);
      props.onChange?.(event);
    },
  });
  const blocked = bindings["aria-disabled"] === true;
  const steppers = (
    <StepButtons
      labels={labels}
      controls={field?.controlId}
      disabled={(direction) => blocked || number.atBound(direction)}
      onStep={number.step}
    />
  );
  return (
    <InputGroup start={startElement} end={steppers}>
      <input
        dir="auto"
        inputMode={number.inputMode}
        autoComplete="off"
        {...bindings}
        name={undefined}
        type="text"
        value={number.display}
        readOnly={blocked || readOnly}
        className={`${textFieldStyles["input"]} ${styles["input"]}`}
        onBlur={(event) => {
          props.onBlur?.(event);
          number.commitTyped(event);
        }}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (event.key === "Enter") number.commitTyped(event);
          if (!blocked) number.keyStep(event);
        }}
      />
      <input type="hidden" name={props.name} value={number.committed ?? ""} />
    </InputGroup>
  );
}

/** Entry of a number, formatted and parsed for the locale, with step buttons and arrow keys. */
export function NumberField({
  label,
  description,
  errorMessage,
  invalid,
  validate,
  size = "md",
  className,
  style,
  ...props
}: NumberFieldProps) {
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
