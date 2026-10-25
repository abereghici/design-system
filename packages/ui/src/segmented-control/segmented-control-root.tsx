"use client";

import { createContext, useId, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import { mergeProps } from "../slot/slot.tsx";
import { followVisualDirection, pointerMarker } from "../toggle/toggle.ts";
import type { ChangeEventDetails } from "../toggle/toggle.ts";

import styles from "./segmented-control.module.css";

interface Group {
  readonly name: string;
  readonly value: string;
  readonly select: (value: string, event: MouseEvent<HTMLInputElement>) => void;
}

export const GroupContext = createContext<Group | null>(null);

export type RootProps = Omit<ComponentProps<"fieldset">, "defaultValue"> & {
  /** Called before the choice changes; `details.cancel()` keeps the old one. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
} & ({ value: string; defaultValue?: never } | { defaultValue: string; value?: never }) &
  ({ "aria-label": string } | { "aria-labelledby": string });

/**
 * Switches between 2–5 views or modes of the same content in place, such as List and Board. Name it
 * with `aria-label`. Arrow keys move and choose (following the reading direction), and every change
 * dispatches a bubbling `ab-toggle`. For sections with their own content use Tabs; for a choice in a
 * form, RadioGroup.
 */
export function Root({
  value,
  defaultValue,
  onValueChange,
  onPointerDown,
  onKeyDown,
  ...props
}: RootProps) {
  const name = useId();
  const marker = pointerMarker({ onPointerDown, onKeyDown });
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const current = value ?? uncontrolled;

  function select(next: string, event: MouseEvent<HTMLInputElement>) {
    if (next === current) return;
    if (!requestChange(onValueChange, next, "none", event.nativeEvent)) {
      event.preventDefault();
      return;
    }
    setUncontrolled(next);
    dispatchFeedback(event.currentTarget, "ab-toggle", {
      component: "SegmentedControl",
      reason: "user",
    });
  }

  return (
    <GroupContext value={{ name, value: current, select }}>
      <fieldset
        {...mergeProps({ className: styles["root"] }, props)}
        role="radiogroup"
        {...marker}
        onKeyDown={(event) => {
          marker.onKeyDown(event);
          followVisualDirection(event);
        }}
      />
    </GroupContext>
  );
}
