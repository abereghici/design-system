"use client";

import { useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/toggle-button-group.css";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { mergeProps } from "../internal/slot/slot.tsx";
import { ToggleGroupContext } from "../internal/toggle/toggle-group.ts";

import styles from "./toggle-button-group.module.css";

export type ToggleButtonGroupChangeEventDetails = Details<"none", MouseEvent<HTMLButtonElement>>;

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

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

const list = (value: string | readonly string[] | undefined) =>
  value === undefined ? [] : typeof value === "string" ? (value === "" ? [] : [value]) : [...value];

/**
 * Holds the pressed state of the ToggleButtons inside it, one at a time or several with
 * `selectionMode="multiple"`. Name it with `aria-label`. Each button keeps its own Tab stop; inside
 * a Toolbar, the Toolbar's arrow keys move between them. It needs script, so it is interactive after
 * hydration (Tier 2). To switch between views of the same content, use SegmentedControl.
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
  const [uncontrolled, setUncontrolled] = useState(() => list(defaultValue));
  const current = value === undefined ? uncontrolled : list(value);
  const multiple = selectionMode === "multiple";

  function toggle(item: string, event: MouseEvent<HTMLButtonElement>) {
    const next = current.includes(item)
      ? current.filter((each) => each !== item)
      : multiple
        ? [...current, item]
        : [item];
    const accepted =
      props.selectionMode === "multiple"
        ? requestChange(props.onValueChange, next, "none", event)
        : requestChange(props.onValueChange, next[0] ?? "", "none", event);

    if (!accepted) return false;

    setUncontrolled(next);

    return true;
  }

  return (
    <ToggleGroupContext value={{ pressed: (item) => current.includes(item), toggle }}>
      <fieldset {...mergeProps({ className: styles["root"] }, rest)} />
    </ToggleGroupContext>
  );
}
