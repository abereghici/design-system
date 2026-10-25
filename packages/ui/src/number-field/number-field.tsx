"use client";

import { useRef, useState } from "react";
import type { ComponentProps, KeyboardEvent, ReactNode, SyntheticEvent } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useField, useFormReset } from "../field/field-control.ts";
import * as Field from "../field/field.tsx";
import { useLocale } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";
import { InputGroup } from "../text-field/text-field.tsx";
import type { TextFieldProps } from "../text-field/text-field.tsx";

import { StepButtons } from "./step-buttons.tsx";
import type { Direction } from "./step-buttons.tsx";
import textFieldStyles from "../text-field/text-field.module.css";
import styles from "./number-field.module.css";

export type NumberFieldChangeEventDetails = Details<
  "input-commit" | "increment-press" | "decrement-press" | "keyboard",
  SyntheticEvent
>;

type Naming =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

type Bounds = { min?: number | undefined; max?: number | undefined; step: number };

type ControlProps = Omit<
  ComponentProps<"input">,
  | "type"
  | "value"
  | "defaultValue"
  | "size"
  | "min"
  | "max"
  | "step"
  | "aria-label"
  | "aria-labelledby"
> & {
  /** The number, when your state holds it; `null` is empty. */
  value?: number | null | undefined;
  /** The starting value when it holds its own state. */
  defaultValue?: number | null | undefined;
  /** Called when a value commits: blur or Enter after typing, a step button, an arrow key. */
  onValueChange?:
    | ((value: number | null, details: NumberFieldChangeEventDetails) => void)
    | undefined;
  /** The lowest value allowed; a lower one is raised to it. */
  min?: number | undefined;
  /** The highest value allowed; a higher one is lowered to it. */
  max?: number | undefined;
  /** How much the arrow keys and step buttons change the value; a typed value rounds to it. */
  step?: number;
  /** The bigger jump for Page Up, Page Down and Shift with an arrow. Defaults to 10 steps. */
  largeStep?: number;
  /** How the number reads and is typed, such as a currency or a unit. */
  formatOptions?: Intl.NumberFormatOptions | undefined;
  /** The language whose number format it uses, when it differs from the Provider's. */
  locale?: string | undefined;
  /** Replaces the built-in text of the Provider's locale, for this instance only. */
  labels?: Partial<Labels["numberField"]>;
  /** Content before the number, such as a currency sign. */
  startElement?: ReactNode;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
};

export type NumberFieldProps = Naming &
  ControlProps &
  Pick<TextFieldProps, "description" | "errorMessage" | "invalid" | "validate" | "size">;

function numberFormat(locale: string, options: Intl.NumberFormatOptions | undefined) {
  const format = new Intl.NumberFormat(locale, options);
  const parts = format.formatToParts(-1234567.89);
  const symbol = (type: Intl.NumberFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
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
  const deltas: Record<string, number> = {
    ArrowUp: large,
    ArrowDown: -large,
    PageUp: largeStep,
    PageDown: -largeStep,
  };
  if (event.key in deltas) return (value: number) => value + (deltas[event.key] ?? 0);
  if (event.key === "Home" && min !== undefined) return () => min;
  if (event.key === "End" && max !== undefined) return () => max;
  return null;
}

type Reason = NumberFieldChangeEventDetails["reason"];

const inputMode = (step: number, min: number | undefined) =>
  Number.isInteger(step) && (min ?? -1) >= 0 ? ("numeric" as const) : ("decimal" as const);

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
    if (requestChange(onValueChange, next, reason, event)) setOwn(next);
  };
  const hidden = useRef<HTMLInputElement>(null);
  useFormReset(
    () => hidden.current,
    () => {
      setOwn(defaultValue);
      setText(null);
    },
  );
  return { committed, text, setText, commit, hidden };
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
  const { committed, text, setText, commit, hidden } = useNumber({
    value,
    defaultValue,
    onValueChange,
  });
  const current = () => {
    const parsed = text === null ? committed : parse(text);
    return parsed !== null && Number.isNaN(parsed) ? committed : parsed;
  };
  const settle = (next: number | null, reason: Reason, event: SyntheticEvent) => {
    commit(next === null ? null : fit(next, { min, max, step }), reason, event);
  };
  return {
    rest,
    hidden,
    inputMode: inputMode(step, min),
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
      const to = stepKey(event, step, largeStep, { min, max, step });
      if (to === null) return;
      event.preventDefault();
      settle(to(current() ?? min ?? 0), "keyboard", event);
    },
  };
}

function Control({ labels, startElement, readOnly, ...options }: ControlProps) {
  const [field] = useField();
  const { rest: props, hidden, ...number } = useNumberValue(options);
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
      <input ref={hidden} type="hidden" name={props.name} value={number.committed ?? ""} />
    </InputGroup>
  );
}

/**
 * A number people type or step, such as a quantity or a price. For digit codes use TextField; to
 * pick by feel, Slider.
 */
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
