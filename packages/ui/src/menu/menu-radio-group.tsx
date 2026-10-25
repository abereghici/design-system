"use client";

import { createContext, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { requestChange } from "../events/events.ts";

import { Group } from "./menu-group.tsx";
import type { ItemChangeEventDetails } from "./menu.tsx";

interface RadioGroupState {
  readonly value: string | null;
  readonly select: (value: string, event: MouseEvent<HTMLButtonElement>) => boolean;
}

export const RadioGroupContext = createContext<RadioGroupState | null>(null);

export interface RadioGroupProps extends Omit<ComponentProps<"fieldset">, "defaultValue"> {
  /** The chosen RadioItem's `value`, when your state holds it. */
  value?: string | null;
  /** The starting value when it holds its own state. */
  defaultValue?: string | null;
  /** Called before the change commits; `details.cancel()` keeps the current choice. */
  onValueChange?: (value: string, details: ItemChangeEventDetails) => void;
}

/** One choice among RadioItems, named by its Label. */
export function RadioGroup({
  value,
  defaultValue = null,
  onValueChange,
  ...props
}: RadioGroupProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;

  function select(next: string, event: MouseEvent<HTMLButtonElement>) {
    if (!requestChange(onValueChange, next, "item-press", event.nativeEvent)) return false;

    setUncontrolled(next);

    return true;
  }

  return (
    <RadioGroupContext value={{ value: current, select }}>
      <Group {...props} />
    </RadioGroupContext>
  );
}
