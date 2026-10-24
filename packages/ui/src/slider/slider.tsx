"use client";

import { Children, createContext, isValidElement, use, useId, useState } from "react";
import type { ComponentProps, KeyboardEvent, PointerEvent } from "react";

import { useFieldControl } from "../field/field-control.ts";
import { useLocale } from "../provider/locale.tsx";

import styles from "./slider.module.css";

type Reason = "track-press" | "drag" | "keyboard";

export interface ChangeEventDetails {
  readonly reason: Reason;
  readonly event: Event;
  /** Keeps the previous value. */
  readonly cancel: () => void;
}

export type CommitEventDetails = Omit<ChangeEventDetails, "cancel">;

export interface RootProps extends Omit<ComponentProps<"div">, "defaultValue"> {
  /** Controlled. An array gives one thumb per entry. */
  value?: number | readonly number[];
  defaultValue?: number | readonly number[];
  /** On every change while dragging or stepping; `details.cancel()` keeps the previous value. */
  onValueChange?: (value: number | number[], details: ChangeEventDetails) => void;
  /** Once per gesture: on pointer release or after a key step. Not called if nothing changed. */
  onValueCommitted?: (value: number | number[], details: CommitEventDetails) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Page Up / Page Down and Shift+Arrow. Defaults to 10 steps. */
  largeStep?: number;
  /** Range sliders: the thumbs can't get closer than this many steps. */
  minStepsBetweenValues?: number;
  /** Formats `aria-valuetext` and Value, in the Provider's locale. */
  format?: Intl.NumberFormatOptions;
  /** Carried by every thumb's input, so a range submits one entry per thumb, in order. */
  name?: string;
  /** Every input gets `aria-disabled="true"`: focusable and announced, but the value can't change. */
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
    const cancelled = new AbortController();
    const cancel = cancelled.abort.bind(cancelled);
    options.onValueChange?.(output(next), { reason, event, cancel });
    if (cancelled.signal.aborted) return from;
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

type Slider = ReturnType<typeof useSliderState>;

const SliderContext = createContext<Slider | null>(null);
const ThumbIndex = createContext(0);

function useSlider() {
  const slider = use(SliderContext);
  if (slider === null) throw new Error("Slider parts must be inside Slider.Root");
  return slider;
}

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
  className,
  ...props
}: RootProps) {
  const slider = useSliderState(
    { value, defaultValue, onValueChange, onValueCommitted, format, name },
    { min, max, step, largeStep, gap: minStepsBetweenValues * step, disabled },
  );
  return (
    <SliderContext value={slider}>
      <div
        {...props}
        data-dragging={slider.dragging === null ? undefined : ""}
        data-disabled={disabled ? "" : undefined}
        className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
      />
    </SliderContext>
  );
}

function drag(event: PointerEvent<HTMLDivElement>, slider: Slider) {
  const track = event.currentTarget;
  const valueAt = ({ clientX }: { clientX: number }) => {
    const rect = track.getBoundingClientRect();
    const fraction = (clientX - rect.left) / rect.width;
    const visual = track.matches(":dir(rtl)") ? 1 - fraction : fraction;
    return slider.min + visual * (slider.max - slider.min);
  };
  const start = slider.values;
  const distances = start.map((entry) => Math.abs(entry - valueAt(event)));
  const index = distances.lastIndexOf(Math.min(...distances));
  track.querySelectorAll("input")[index]?.focus();
  slider.setDragging(index);
  let last = slider.change(index, valueAt(event), "track-press", event.nativeEvent);
  let reason: Reason = "track-press";
  const controller = new AbortController();
  const { signal } = controller;
  const move = (moved: globalThis.PointerEvent) => {
    reason = "drag";
    last = slider.change(index, valueAt(moved), "drag", moved, last);
  };
  const release = (released: Event) => {
    controller.abort();
    slider.setDragging(null);
    slider.commit(start, last, { reason, event: released });
  };
  track.ownerDocument.addEventListener("pointerup", release, { signal });
  track.ownerDocument.addEventListener("pointercancel", release, { signal });
  track.ownerDocument.addEventListener("pointermove", move, { signal });
}

export type TrackProps = ComponentProps<"div">;

export function Track({ className, children, ...props }: TrackProps) {
  const slider = useSlider();
  let thumb = 0;
  return (
    <div
      {...props}
      className={className === undefined ? styles["track"] : `${styles["track"]} ${className}`}
      onPointerDown={(event) => {
        if (slider.disabled || event.button !== 0) return;
        event.preventDefault();
        drag(event, slider);
      }}
    >
      {Children.map(children, (child) =>
        isValidElement(child) && child.type === Thumb ? (
          <ThumbIndex value={thumb++}>{child}</ThumbIndex>
        ) : (
          child
        ),
      )}
    </div>
  );
}

export type RangeProps = ComponentProps<"div">;

export function Range({ className, style, ...props }: RangeProps) {
  const { values, percent } = useSlider();
  const first = values.length > 1 ? percent(values[0] ?? 0) : 0;
  const last = percent(values.at(-1) ?? 0);
  return (
    <div
      {...props}
      className={className === undefined ? styles["range"] : `${styles["range"]} ${className}`}
      style={{ insetInlineStart: `${first}%`, inlineSize: `${last - first}%`, ...style }}
    />
  );
}

export type ThumbProps = Omit<ComponentProps<"input">, "type" | "value" | "min" | "max" | "step">;

function keyTarget(
  event: KeyboardEvent<HTMLInputElement>,
  value: number,
  step: number,
  large: number,
) {
  const sign = event.currentTarget.matches(":dir(rtl)") ? -1 : 1;
  const amount = event.shiftKey ? large : step;
  const targets: Partial<Record<string, number>> = {
    ArrowRight: value + sign * amount,
    ArrowLeft: value - sign * amount,
    ArrowUp: value + amount,
    ArrowDown: value - amount,
    PageUp: value + large,
    PageDown: value - large,
    Home: -Infinity,
    End: Infinity,
  };
  return targets[event.key];
}

export function Thumb({ className, style, id, onKeyDown, onChange, ...props }: ThumbProps) {
  const slider = useSlider();
  const index = use(ThumbIndex);
  const value = slider.values[index] ?? slider.min;
  const [lo, hi] = slider.bounds(index);
  const ownId = id ?? `${slider.id}-${index}`;
  const own = { id: index === 0 ? ownId : undefined, name: slider.name, disabled: slider.disabled };
  const bindings = useFieldControl<HTMLInputElement, ThumbProps>({ ...props, ...own });
  const blocked = bindings["aria-disabled"] === true;
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    const target = keyTarget(event, value, slider.step, slider.largeStep);
    if (target === undefined || event.defaultPrevented) return;
    event.preventDefault();
    if (blocked) return;
    const next = slider.change(index, target, "keyboard", event.nativeEvent);
    slider.commit(slider.values, next, { reason: "keyboard", event: event.nativeEvent });
  }
  return (
    <div
      className={className === undefined ? styles["thumb"] : `${styles["thumb"]} ${className}`}
      data-dragging={slider.dragging === index ? "" : undefined}
      style={{ insetInlineStart: `${slider.percent(value)}%`, ...style }}
    >
      <input
        {...bindings}
        id={ownId}
        type="range"
        min={lo}
        max={hi}
        step={slider.step}
        value={value}
        aria-valuetext={slider.format(value)}
        className={styles["input"]}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          onChange?.(event);
          if (blocked) return;
          slider.change(index, event.currentTarget.valueAsNumber, "keyboard", event.nativeEvent);
        }}
      />
    </div>
  );
}

export type ValueProps = ComponentProps<"output">;

export function Value({ className, children, ...props }: ValueProps) {
  const { id, values, format } = useSlider();
  return (
    <output
      htmlFor={values.map((_, index) => `${id}-${index}`).join(" ")}
      aria-live="off"
      {...props}
      className={className === undefined ? styles["value"] : `${styles["value"]} ${className}`}
    >
      {children ?? values.map((entry) => format(entry)).join("–")}
    </output>
  );
}
