"use client";

import { useId, useRef, useState } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/slider.css";

import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { composeRefs } from "../internal/compose-refs/compose-refs.ts";
import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";
import type { EventTargetSource } from "../internal/dom-event/use-event.ts";
import { useLocale } from "../internal/locale/use-locale.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { snapValueToStep } from "../internal/snap-value-to-step/snap-value-to-step.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import styles from "./slider.module.css";

export type Reason = "track-press" | "drag" | "keyboard";

export type ChangeEventDetails = Details<Reason>;

export type CommitEventDetails = Omit<ChangeEventDetails, "cancel">;

export interface RootProps extends Omit<ComponentProps<"div">, "defaultValue"> {
  /** The value, when your state holds it. An array gives one thumb per entry, for a range. */
  value?: number | readonly number[];
  /** The starting value when it holds its own state; an array for a range. */
  defaultValue?: number | readonly number[];
  /** Called while dragging or stepping; `details.cancel()` keeps the previous value. */
  onValueChange?: (value: number | number[], details: ChangeEventDetails) => void;
  /** Called once per gesture, when the user lets go or after a key step: the moment to save. */
  onValueCommitted?: (value: number | number[], details: CommitEventDetails) => void;
  /** The lowest value, at the start of the track. */
  min?: number;
  /** The highest value, at the end of the track. */
  max?: number;
  /** The smallest change, for the arrow keys and dragging alike. */
  step?: number;
  /** The bigger jump for Page Up, Page Down and Shift with an arrow. Defaults to 10 steps. */
  largeStep?: number;
  /** For a range: the fewest steps the thumbs keep between them. */
  minStepsBetweenValues?: number;
  /** How the value reads, shown and spoken, such as a currency or a percent. */
  format?: Intl.NumberFormatOptions;
  /** The form field name; a range submits one entry per thumb, in order. */
  name?: string;
  /** Blocks changes but keeps it focusable and announced; say nearby why it is unavailable. */
  disabled?: boolean;
}

type Options = {
  readonly [
    Key in "value" | "defaultValue" | "onValueChange" | "onValueCommitted" | "format" | "name"
  ]: RootProps[Key];
};

type Scale = Readonly<Record<"min" | "max" | "step" | "largeStep" | "gap", number>> & {
  readonly disabled: boolean;
};

function useSliderState(options: Options, scale: Scale, form: EventTargetSource) {
  const { min, max, step, gap } = scale;
  const [current, request] = useControllableState(
    options.value,
    options.defaultValue ?? min,
    options.onValueChange,
    form,
  );
  const [dragging, setDragging] = useState<number | null>(null);
  const formatter = new Intl.NumberFormat(useLocale(), options.format);
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

export const [SliderContext, useSlider] = createSafeContext<Slider>("Slider.Root");

/**
 * A value or range picked by feel (volume, price). For an exact number, use NumberField.
 *
 * Tier 1: works before hydration. While scripting is off it shows the browser's own slider, one
 * per thumb, without the value text.
 */
export function Root({
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep,
  minStepsBetweenValues = 0,
  format,
  name,
  disabled = false,
  ref,
  ...props
}: RootProps) {
  const root = useRef<HTMLDivElement>(null);
  const slider = useSliderState(
    { value, defaultValue, onValueChange, onValueCommitted, format, name },
    {
      min,
      max,
      step,
      largeStep: largeStep ?? 10 * step,
      gap: minStepsBetweenValues * step,
      disabled,
    },
    () => root.current?.querySelector("input")?.form,
  );

  return (
    <SliderContext value={slider}>
      <div
        {...mergeProps({ className: styles["root"] }, props)}
        ref={composeRefs(root, ref)}
        data-dragging={slider.dragging === null ? undefined : ""}
        data-disabled={disabled ? "" : undefined}
      />
    </SliderContext>
  );
}
