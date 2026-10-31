"use client";

import { use } from "react";
import type { ComponentProps, MouseEvent, ReactNode } from "react";

import "@abereghici/tokens/components/toggle-button.css";

import { dispatchFeedback } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useControllableState } from "../events/use-controllable-state.ts";
import { mergeProps } from "../internal/slot/slot.tsx";
import { ToggleGroupContext } from "../internal/toggle/toggle-group.ts";

import styles from "./toggle-button.module.css";

export type ToggleButtonChangeEventDetails = Details<"none", MouseEvent<HTMLButtonElement>>;

export type ToggleButtonProps = Omit<ComponentProps<"button">, "type" | "value" | "children"> & {
  /** Says what the button turns on, as its visible label. */
  children: ReactNode;
  /** Names this button in a ToggleButtonGroup's value, and tells it apart from its siblings. */
  value: string;
  /** Whether it is on, when your state holds it; a ToggleButtonGroup holds it instead. */
  pressed?: boolean;
  /** Whether it starts on when it holds its own state. */
  defaultPressed?: boolean;
  /** Called before it turns on or off; `details.cancel()` keeps the current state. */
  onPressedChange?: (pressed: boolean, details: ToggleButtonChangeEventDetails) => void;
  /**
   * `lg` for prominent or spacious layouts, `sm` for dense ones. Touch screens get larger targets
   * on their own.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
} & ({ pressed?: never } | { defaultPressed?: never });

/**
 * A button that stays on or off, such as Bold in a formatting toolbar; a screen reader announces it
 * as pressed. Each change dispatches a bubbling `ab-toggle`. Put several in a ToggleButtonGroup, or
 * in a Toolbar, whose arrow keys then move between them. To switch between views of the same
 * content, use SegmentedControl; for an icon alone, IconButton; for a single action, Button.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, it is
 * hidden.
 */
export function ToggleButton({
  value,
  pressed,
  defaultPressed,
  onPressedChange,
  size = "md",
  disabled = false,
  onClick,
  ...props
}: ToggleButtonProps) {
  const group = use(ToggleGroupContext);
  const [own, request] = useControllableState(pressed, defaultPressed ?? false, onPressedChange);
  const current = group?.pressed(value) ?? own;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (disabled) {
      event.preventDefault();

      return;
    }

    onClick?.(event);

    if (group === null) {
      if (!request(!current, "none", event)) return;
    } else if (!group.toggle(value, event)) return;

    dispatchFeedback(event.currentTarget, "ab-toggle", {
      component: "ToggleButton",
      reason: "user",
    });
  }

  return (
    <button
      {...mergeProps({ className: styles["root"] }, props)}
      type="button"
      aria-pressed={current}
      aria-disabled={disabled ? true : undefined}
      data-size={size}
      onClick={handleClick}
    />
  );
}
