"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { mergeProps } from "../slot/slot.tsx";
import { useLocale } from "../ui-provider/locale.tsx";

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
  min?: number;
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

function snap(raw: number, min: number, step: number) {
  const decimals = String(step).split(".")[1]?.length ?? 0;
  return Number((Math.round((raw - min) / step) * step + min).toFixed(decimals));
}

type Options = {
  readonly [
    Key in "value" | "defaultValue" | "onValueChange" | "onValueCommitted" | "format" | "name"
  ]: RootProps[Key];
};

type Scale = Readonly<Record<"min" | "max" | "step" | "largeStep" | "gap", number>> & {
  readonly disabled: boolean;
};

function useSliderState(options: Options, scale: Scale) {
  const { min, max, step, gap } = scale;
  const [uncontrolled, setUncontrolled] = useState(options.defaultValue ?? min);
  const [dragging, setDragging] = useState<number | null>(null);
  const formatter = new Intl.NumberFormat(useLocale().tag, options.format);
  const current = options.value ?? uncontrolled;
  const values = typeof current === "number" ? [current] : current;
  const output = (next: readonly number[]) =>
    typeof current === "number" ? (next[0] ?? min) : [...next];
  const bounds = (index: number, from = values) =>
    [(from[index - 1] ?? min - gap) + gap, (from[index + 1] ?? max + gap) - gap] as const;
  function change(index: number, raw: number, reason: Reason, event: Event, from = values) {
    const [lo, hi] = bounds(index, from);
    const next = from.with(index, Math.min(Math.max(snap(raw, min, step), lo), hi));
    if (next[index] === from[index]) return from;
    if (!requestChange(options.onValueChange, output(next), reason, event)) return from;
    setUncontrolled(output(next));
    return next;
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

const SliderContext = createContext<Slider | null>(null);

export const ThumbIndex = createContext(0);

export function useSlider() {
  const slider = use(SliderContext);
  if (slider === null) throw new Error("Slider parts must be inside Slider.Root");
  return slider;
}

/** A value or range picked by feel (volume, price). For an exact number, use NumberField. */
export function Root({
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep = 10 * step,
  minStepsBetweenValues = 0,
  format,
  name,
  disabled = false,
  ...props
}: RootProps) {
  const slider = useSliderState(
    { value, defaultValue, onValueChange, onValueCommitted, format, name },
    { min, max, step, largeStep, gap: minStepsBetweenValues * step, disabled },
  );
  return (
    <SliderContext value={slider}>
      <div
        {...mergeProps({ className: styles["root"] }, props)}
        data-dragging={slider.dragging === null ? undefined : ""}
        data-disabled={disabled ? "" : undefined}
      />
    </SliderContext>
  );
}
