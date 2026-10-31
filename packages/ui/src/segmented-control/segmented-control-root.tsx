"use client";

import { useId } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent } from "react";

import "@abereghici/tokens/components/segmented-control.css";

import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";
import { pointerMarker } from "../internal/interaction/pointer-marker.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { followVisualDirection } from "../internal/radio-choice/follow-visual-direction.ts";
import { useRadioChoice } from "../internal/radio-choice/use-radio-choice.ts";

import styles from "./segmented-control.module.css";

/** `cancel()`: keeps the previous choice: the browser restores it once the click is cancelled. */
export type ChangeEventDetails = Details<"none">;

interface Group {
  readonly name: string;
  readonly value: string | null;
  readonly select: (value: string, event: MouseEvent<HTMLInputElement>) => void;
}

export const [GroupContext, useSegmentedControl] =
  createSafeContext<Group>("SegmentedControl.Root");

export type RootProps = Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "aria-label" | "aria-labelledby"
> & {
  /** The chosen segment's `value`, when your state holds it. */
  value?: string;
  /** The segment chosen on the first render when it holds its own state. */
  defaultValue?: string;
  /** Called before the choice changes; `details.cancel()` keeps the old one. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /** The form field name the chosen segment submits under, when the view is part of a form. */
  name?: string;
} & ({ value: string; defaultValue?: never } | { defaultValue: string; value?: never }) &
  AccessibleName;

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
