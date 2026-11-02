"use client";

import { useId } from "react";
import type { ComponentProps, KeyboardEvent, MouseEvent } from "react";

import { pointerMarker } from "../../internal/interactions/pointer-marker.ts";
import { followVisualDirection } from "../../internal/selection/follow-visual-direction.ts";
import { useRadioChoice } from "../../internal/selection/use-radio-choice.ts";
import type { ChangeEventDetails as Details } from "../../internal/state/change-request.ts";
import type { AccessibleName } from "../../internal/types/accessible-name.ts";
import { createSafeContext } from "../../internal/utils/create-safe-context.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";

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
