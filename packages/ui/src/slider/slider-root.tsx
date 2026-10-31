"use client";

import { useRef } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/slider.css";

import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { composeRefs } from "../internal/compose-refs/compose-refs.ts";
import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { useSliderState } from "./use-slider-state.ts";
import type { Slider } from "./use-slider-state.ts";
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
