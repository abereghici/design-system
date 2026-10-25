"use client";

import { Children, isValidElement } from "react";
import type { ComponentProps, PointerEvent } from "react";

import { join } from "../slot/slot.tsx";

import type { Reason, Slider } from "./slider-root.tsx";
import { ThumbIndex, useSlider } from "./slider-root.tsx";
import { Thumb } from "./slider-thumb.tsx";
import styles from "./slider.module.css";

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
      className={join(styles["track"], className)}
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
