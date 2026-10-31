"use client";

import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/toggle-button-group.css";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useControllableState } from "../events/use-controllable-state.ts";
import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import { mergeProps } from "../internal/slot/slot.tsx";
import { ToggleGroupContext } from "../internal/toggle/toggle-group.ts";
import { toggled, valuesOf } from "../internal/toggle/toggle.ts";

import styles from "./toggle-button-group.module.css";

export type ToggleButtonGroupChangeEventDetails = Details<"none", MouseEvent<HTMLButtonElement>>;

interface Single {
  /** How many buttons can be pressed at once. */
  selectionMode?: "single";
  /** The pressed button's `value`, when your state holds it; `""` while none is. */
  value?: string;
  /** The button pressed on the first render when the group holds its own state. */
  defaultValue?: string;
  /** Called before a button turns on or off; `details.cancel()` keeps the current state. */
  onValueChange?: (value: string, details: ToggleButtonGroupChangeEventDetails) => void;
}

interface Multiple {
  /** How many buttons can be pressed at once. */
  selectionMode: "multiple";
  /** The pressed buttons' `value`s, when your state holds them. */
  value?: string[];
  /** The buttons pressed on the first render when the group holds its own state. */
  defaultValue?: string[];
  /** Called before a button turns on or off; `details.cancel()` keeps the current state. */
  onValueChange?: (value: string[], details: ToggleButtonGroupChangeEventDetails) => void;
}

export type ToggleButtonGroupProps = Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "aria-label" | "aria-labelledby"
> &
  AccessibleName &
  (Single | Multiple) &
  ({ value?: never } | { defaultValue?: never });

/**
 * Holds the pressed state of the ToggleButtons inside it, one at a time or several with
 * `selectionMode="multiple"`. Name it with `aria-label`. Each button keeps its own Tab stop; inside
 * a Toolbar, the Toolbar's arrow keys move between them. To switch between views of the same
 * content, use SegmentedControl.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, its
 * buttons are hidden.
 */
export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  // `_onValueChange` is destructured only to keep it off the fieldset; `toggle` reads it from
  // `props`, where `selectionMode` narrows it to the shape the consumer passed.
  const {
    selectionMode = "single",
    value,
    defaultValue,
    onValueChange: _onValueChange,
    ...rest
  } = props;
  const [current, , set] = useControllableState(
    value === undefined ? undefined : valuesOf(value),
    valuesOf(defaultValue),
  );
  const multiple = selectionMode === "multiple";

  function toggle(item: string, event: MouseEvent<HTMLButtonElement>) {
    const next = multiple || current.includes(item) ? toggled(current, item) : [item];
    const accepted =
      props.selectionMode === "multiple"
        ? requestChange(props.onValueChange, next, "none", event)
        : requestChange(props.onValueChange, next[0] ?? "", "none", event);

    if (!accepted) return false;

    set(next);

    return true;
  }

  return (
    <ToggleGroupContext value={{ pressed: (item) => current.includes(item), toggle }}>
      <fieldset {...mergeProps({ className: styles["root"] }, rest)} />
    </ToggleGroupContext>
  );
}
