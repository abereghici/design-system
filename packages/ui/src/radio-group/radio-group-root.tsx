"use client";

import { createContext, useId } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent } from "react";

import "@abereghici/tokens/components/fieldset.css";
import "@abereghici/tokens/components/radio-group.css";

import { pointerMarker } from "../events/events.ts";
import { followVisualDirection } from "../internal/follow-visual-direction/follow-visual-direction.ts";
import { mergeProps } from "../internal/slot/slot.tsx";
import { useRadioChoice } from "../internal/toggle/toggle.ts";
import type { ChangeEventDetails } from "../internal/toggle/toggle.ts";

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
 *
 * Tier 1: works before hydration.
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
  const { current, select, setRoot } = useRadioChoice(
    "RadioGroup",
    value,
    defaultValue,
    onValueChange,
  );

  return (
    <GroupContext
      value={{ name: name ?? fallbackName, value: current, required, disabled, select }}
    >
      <fieldset
        {...mergeProps(
          {
            ref: setRoot,
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
