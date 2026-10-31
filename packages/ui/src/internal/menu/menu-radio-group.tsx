"use client";

import { createContext } from "react";
import type { ComponentProps, MouseEvent } from "react";

import { useControllableState } from "../../events/use-controllable-state.ts";

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
  const [current, request] = useControllableState(value, defaultValue, onValueChange);

  function select(next: string, event: MouseEvent<HTMLButtonElement>) {
    return request(next, "item-press", event.nativeEvent);
  }

  return (
    <RadioGroupContext value={{ value: current, select }}>
      <Group {...props} />
    </RadioGroupContext>
  );
}
