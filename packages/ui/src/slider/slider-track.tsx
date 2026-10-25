"use client";

import { useRef } from "react";
import type { ComponentProps, PointerEvent } from "react";

import { mergeProps } from "../slot/slot.tsx";

import type { Reason } from "./slider-root.tsx";
import { useSlider } from "./slider-root.tsx";
import styles from "./slider.module.css";

interface Drag {
  readonly index: number;
  readonly start: readonly number[];
  last: readonly number[];
  reason: Reason;
}

function valueAt(event: PointerEvent<HTMLDivElement>, min: number, max: number) {
  const rect = event.currentTarget.getBoundingClientRect();
  const fraction = (event.clientX - rect.left) / rect.width;
  const visual = event.currentTarget.matches(":dir(rtl)") ? 1 - fraction : fraction;
  return min + visual * (max - min);
}

export type TrackProps = ComponentProps<"div">;

/** Moves the nearest thumb to a press, then follows the drag with the pointer captured. */
function useDrag(slider: ReturnType<typeof useSlider>) {
  const drag = useRef<Drag | null>(null);
  const release = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (current === null) return;
    drag.current = null;
    slider.setDragging(null);
    slider.commit(current.start, current.last, {
      reason: current.reason,
      event: event.nativeEvent,
    });
  };
  return {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      if (slider.disabled || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const at = valueAt(event, slider.min, slider.max);
      const distances = slider.values.map((entry) => Math.abs(entry - at));
      const index = distances.lastIndexOf(Math.min(...distances));
      event.currentTarget.querySelectorAll("input")[index]?.focus();
      slider.setDragging(index);
      const last = slider.change(index, at, "track-press", event.nativeEvent);
      drag.current = { index, start: slider.values, last, reason: "track-press" };
    },
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
      const current = drag.current;
      if (current === null) return;
      current.reason = "drag";
      const at = valueAt(event, slider.min, slider.max);
      current.last = slider.change(current.index, at, "drag", event.nativeEvent, current.last);
    },
    onPointerUp: release,
    onPointerCancel: release,
  };
}

/** The rail: a press moves the nearest thumb there; dragging follows the pointer. */
export function Track(props: TrackProps) {
  const drag = useDrag(useSlider());
  return <div {...mergeProps({ className: styles["track"], ...drag }, props)} />;
}
