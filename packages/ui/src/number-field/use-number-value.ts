import { useRef, useState } from "react";
import type { KeyboardEvent, SyntheticEvent } from "react";

import { useEvent } from "../internal/dom-event/use-event.ts";
import { useNumberFormatter } from "../internal/locale/use-number-formatter.ts";
import { snapValueToStep } from "../internal/snap-value-to-step/snap-value-to-step.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import type { Direction } from "./number-field-step-buttons.tsx";
import type { ControlProps, NumberFieldChangeEventDetails } from "./number-field.tsx";
import { parseNumber } from "./parse-number.ts";

type Bounds = Partial<Record<"min" | "max", number | undefined>>;

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
  const formatter = useNumberFormatter(formatOptions);
  const { committed, text, setText, commit, hidden } = useNumber({
    value,
    defaultValue,
    onValueChange,
  });
  const current = () => {
    const parsed = text === null ? committed : parseNumber(text, formatter);

    return parsed !== null && Number.isNaN(parsed) ? committed : parsed;
  };

  const settle = (next: number | null, reason: Reason, event: SyntheticEvent) => {
    commit(next === null ? null : snapValueToStep(next, min, max, step), reason, event);
  };

  return {
    rest,
    hidden,
    inputMode: inputMode(step, min),
    committed,
    display: text ?? (committed === null ? "" : formatter.format(committed)),
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
      const to = stepKey(event, step, largeStep ?? step * 10, { min, max });

      if (to === null) return;

      event.preventDefault();
      settle(to(current() ?? min ?? 0), "keyboard", event);
    },
  };
}
