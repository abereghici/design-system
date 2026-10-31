"use client";

import { createContext, useId } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent } from "react";

import "@abereghici/tokens/components/segmented-control.css";

import { pointerMarker } from "../events/events.ts";
import { followVisualDirection } from "../internal/follow-visual-direction/follow-visual-direction.ts";
import { mergeProps } from "../internal/slot/slot.tsx";
import { useRadioChoice } from "../internal/toggle/toggle.ts";
import type { ChangeEventDetails } from "../internal/toggle/toggle.ts";

import styles from "./segmented-control.module.css";

interface Group {
  readonly name: string;
  readonly value: string | null;
  readonly select: (value: string, event: MouseEvent<HTMLInputElement>) => void;
}

export const GroupContext = createContext<Group | null>(null);

export type RootProps = Omit<ComponentProps<"fieldset">, "defaultValue"> & {
  /** The chosen segment's `value`, when your state holds it. */
  value?: string;
  /** The segment chosen on the first render when it holds its own state. */
  defaultValue?: string;
  /** Called before the choice changes; `details.cancel()` keeps the old one. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /** The form field name the chosen segment submits under, when the view is part of a form. */
  name?: string;
} & ({ value: string; defaultValue?: never } | { defaultValue: string; value?: never }) &
  ({ "aria-label": string } | { "aria-labelledby": string });

/**
 * Switches between 2–5 views or modes of the same content in place, such as List and Board. Name it
 * with `aria-label`. Arrow keys move and choose (following the reading direction), and every change
 * dispatches a bubbling `ab-toggle`. For sections with their own content use Tabs; for a choice in a
 * form, RadioGroup.
 *
 * Tier 1: works before hydration.
 */
export function Root({ value, defaultValue, onValueChange, name, ...props }: RootProps) {
  const fallbackName = useId();
  const { current, select, setRoot } = useRadioChoice(
    "SegmentedControl",
    value,
    defaultValue ?? "",
    onValueChange,
  );

  return (
    <GroupContext value={{ name: name ?? fallbackName, value: current, select }}>
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
      />
    </GroupContext>
  );
}
