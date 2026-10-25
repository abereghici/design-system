"use client";

import { use } from "react";
import type { ComponentProps, KeyboardEvent } from "react";

import { useFieldControl } from "../field/use-field.ts";
import { join } from "../slot/slot.tsx";

import { ThumbIndex, useSlider } from "./slider-root.tsx";
import styles from "./slider.module.css";

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
