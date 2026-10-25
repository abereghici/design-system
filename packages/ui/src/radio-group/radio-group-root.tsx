"use client";

import { createContext, useId, useState } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent } from "react";

import { dispatchFeedback, pointerMarker, requestChange } from "../events/events.ts";
import { mergeProps } from "../slot/slot.tsx";
import type { ChangeEventDetails } from "../toggle/toggle.ts";

import { followVisualDirection } from "./follow-visual-direction.ts";
import styles from "./radio-group.module.css";

interface Group {
  readonly name: string;
  readonly value: string | null;
  readonly required: boolean | undefined;
  readonly disabled: boolean;
  readonly select: (value: string, event: MouseEvent<HTMLInputElement>) => void;
}

export const GroupContext = createContext<Group | null>(null);

export interface RootProps extends Omit<ComponentProps<"fieldset">, "defaultValue" | "disabled"> {
  /** The chosen option, when your state holds it; `null` when nothing is chosen. */
  value?: string | null;
  /** The starting value when it holds its own state. */
  defaultValue?: string | null;
  /** Called before the choice changes; `details.cancel()` keeps the old one. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /** The form field name the choice submits under. */
  name?: string;
  /** Makes a choice necessary before the form submits. */
  required?: boolean;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
  /** `horizontal` for two or three short options that fit on one line. */
  orientation?: "vertical" | "horizontal";
}

/**
 * One choice among 2–6 options that should all stay visible, under a Label. Arrow keys move and
 * choose (following the reading direction), and every change dispatches a bubbling `ab-toggle`. With
 * more options use Select; for a yes/no choice, Switch or Checkbox.
 */
export function Root({
  value,
  defaultValue = null,
  onValueChange,
  name,
  required,
  disabled = false,
  orientation = "vertical",
  ...props
}: RootProps) {
  const fallbackName = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;

  function select(next: string, event: MouseEvent<HTMLInputElement>) {
    if (next === current) return;
    if (!requestChange(onValueChange, next, "none", event.nativeEvent)) {
      event.preventDefault();
      return;
    }
    setUncontrolled(next);
    dispatchFeedback(event.currentTarget, "ab-toggle", { component: "RadioGroup", reason: "user" });
  }

  return (
    <GroupContext
      value={{ name: name ?? fallbackName, value: current, required, disabled, select }}
    >
      <fieldset
        {...mergeProps(
          {
            className: styles["root"],
            onPointerDown: pointerMarker.onPointerDown,
            onKeyDown: (event: KeyboardEvent<HTMLFieldSetElement>) => {
              pointerMarker.onKeyDown(event);
              followVisualDirection(event);
            },
          },
          props,
        )}
        role="radiogroup"
        aria-orientation={orientation}
        data-orientation={orientation}
      />
    </GroupContext>
  );
}
