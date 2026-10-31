import { useId, useState } from "react";

import type { EventTargetSource } from "../internal/dom-event/use-event.ts";
import { useNumberFormatter } from "../internal/locale/use-number-formatter.ts";
import { snapValueToStep } from "../internal/snap-value-to-step/snap-value-to-step.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import type { CommitEventDetails, Reason, RootProps } from "./slider-root.tsx";

type Options = {
  readonly [
    Key in "value" | "defaultValue" | "onValueChange" | "onValueCommitted" | "format" | "name"
  ]: RootProps[Key];
};

type Scale = Readonly<Record<"min" | "max" | "step" | "largeStep" | "gap", number>> & {
  readonly disabled: boolean;
};

/** The Slider's values, the thumb being dragged, and each change kept within steps and bounds. */
export function useSliderState(options: Options, scale: Scale, form: EventTargetSource) {
  const { min, max, step, gap } = scale;
  const [current, request] = useControllableState(
    options.value,
    options.defaultValue ?? min,
    options.onValueChange,
    form,
  );
  const [dragging, setDragging] = useState<number | null>(null);
  const formatter = useNumberFormatter(options.format);
  const values = typeof current === "number" ? [current] : current;
  const output = (next: readonly number[]) =>
    typeof current === "number" ? (next[0] ?? min) : [...next];
  const bounds = (index: number, from = values) =>
    [(from[index - 1] ?? min - gap) + gap, (from[index + 1] ?? max + gap) - gap] as const;

  function change(index: number, raw: number, reason: Reason, event: Event, from = values) {
    const [lo, hi] = bounds(index, from);
    const next = from.with(index, Math.min(Math.max(snapValueToStep(raw, min, max, step), lo), hi));

    if (next[index] === from[index]) return from;

    return request(output(next), reason, event) ? next : from;
  }

  function commit(from: readonly number[], to: readonly number[], details: CommitEventDetails) {
    if (to.some((entry, index) => entry !== from[index])) {
      options.onValueCommitted?.(output(to), details);
    }
  }

  return {
    ...scale,
    id: useId(),
    name: options.name,
    values,
    dragging,
    setDragging,
    bounds,
    change,
    commit,
    format: (entry: number) => formatter.format(entry),
    percent: (entry: number) => ((entry - min) / (max - min)) * 100,
  };
}

export type Slider = ReturnType<typeof useSliderState>;
