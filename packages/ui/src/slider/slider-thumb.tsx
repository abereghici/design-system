"use client";

import type { ComponentProps, KeyboardEvent } from "react";

import { useFieldControl } from "../field/use-field.ts";
import { join } from "../slot/slot.tsx";

import { useSlider } from "./slider-root.tsx";
import type { Slider } from "./slider-root.tsx";
import styles from "./slider.module.css";

export interface ThumbProps extends Omit<
  ComponentProps<"input">,
  "type" | "value" | "min" | "max" | "step"
> {
  /** Which entry of a range's value this thumb sets, counting from 0. */
  index?: number;
}

function step(
  event: KeyboardEvent<HTMLInputElement>,
  slider: Slider,
  index: number,
  blocked: boolean,
) {
  const value = slider.values[index] ?? slider.min;
  const large = slider.largeStep;
  const sign = event.currentTarget.matches(":dir(rtl)") ? -1 : 1;
  const amount = event.shiftKey ? large : slider.step;
  const target = {
    ArrowRight: value + sign * amount,
    ArrowLeft: value - sign * amount,
    ArrowUp: value + amount,
    ArrowDown: value - amount,
    PageUp: value + large,
    PageDown: value - large,
    Home: -Infinity,
    End: Infinity,
  }[event.key];
  if (target === undefined) return;
  event.preventDefault();
  if (blocked) return;
  const next = slider.change(index, target, "keyboard", event.nativeEvent);
  slider.commit(slider.values, next, { reason: "keyboard", event: event.nativeEvent });
}

export function Thumb({
  index = 0,
  className,
  style,
  id,
  onKeyDown,
  onChange,
  ...props
}: ThumbProps) {
  const slider = useSlider();
  const value = slider.values[index] ?? slider.min;
  const [lo, hi] = slider.bounds(index);
  const ownId = id ?? `${slider.id}-${index}`;
  const own = { id: index === 0 ? ownId : undefined, name: slider.name, disabled: slider.disabled };
  const bindings = useFieldControl<HTMLInputElement, ThumbProps>({ ...props, ...own });
  const blocked = bindings["aria-disabled"] === true;
  return (
    <div
      className={join(styles["thumb"], className)}
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
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) step(event, slider, index, blocked);
        }}
        onChange={(event) => {
          onChange?.(event);
          if (blocked) return;
          slider.change(index, event.currentTarget.valueAsNumber, "keyboard", event.nativeEvent);
        }}
      />
    </div>
  );
}
