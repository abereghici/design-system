import { useRef, useState } from "react";
import type { KeyboardEvent, SyntheticEvent } from "react";

import { useEvent } from "../internal/dom-event/use-event.ts";
import { useLocale } from "../internal/locale/use-locale.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import type { Direction } from "./number-field-step-buttons.tsx";
import type { ControlProps, NumberFieldChangeEventDetails } from "./number-field.tsx";

type Bounds = { min?: number | undefined; max?: number | undefined; step: number };

function buildNumberFormat(
  locale: Intl.LocalesArgument,
  options: Intl.NumberFormatOptions | undefined,
) {
  const format = new Intl.NumberFormat(locale, options);
  const parts = format.formatToParts(-1234567.89);
  const symbol = (type: Intl.NumberFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const digitFormat = new Intl.NumberFormat(locale, { useGrouping: false });
  const digits = Array.from({ length: 10 }, (_, digit) => digitFormat.format(digit));
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

const numberFormats = new Map<string, ReturnType<typeof buildNumberFormat>>();

function numberFormat(locale: Intl.LocalesArgument, options: Intl.NumberFormatOptions | undefined) {
  const key = `${String(locale)} ${JSON.stringify(options)}`;
  const cached = numberFormats.get(key) ?? buildNumberFormat(locale, options);

  numberFormats.set(key, cached);

  return cached;
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
  const hidden = useRef<HTMLInputElement>(null);
  const form = () => hidden.current?.form;
  const [committed, change] = useControllableState(value, defaultValue, onValueChange, form);
  const [text, setText] = useState<string | null>(null);
  const commit = (next: number | null, reason: Reason, event: SyntheticEvent) => {
    setText(null);

    if (next !== committed) change(next, reason, event);
  };

  useEvent(
    "reset",
    () => {
      setText(null);
    },
    form,
  );

  return { committed, text, setText, commit, hidden };
}

/** NumberField's value, its text in the app's locale, and its stepping. */
export function useNumberValue({
  value,
  defaultValue,
  onValueChange,
  formatOptions,
  min,
  max,
  step = 1,
  largeStep,
  ...rest
}: Omit<ControlProps, "startElement" | "incrementLabel" | "decrementLabel">) {
  const { format, parse } = numberFormat(useLocale(), formatOptions);
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
    commitTyped: (event: SyntheticEvent, reason: "input-blur" | "keyboard") => {
      settle(current(), reason, event);
    },
    keyStep: (event: KeyboardEvent) => {
      const to = stepKey(event, step, largeStep ?? step * 10, { min, max, step });

      if (to === null) return;

      event.preventDefault();
      settle(to(current() ?? min ?? 0), "keyboard", event);
    },
  };
}
