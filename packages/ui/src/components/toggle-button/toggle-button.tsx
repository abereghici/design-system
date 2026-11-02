"use client";

import type { ComponentProps, ReactNode } from "react";

import { TouchTarget } from "../../internal/components/touch-target/touch-target.tsx";
import type { InvokerCommands } from "../../internal/types/invoker-commands.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";

import { useToggleButton } from "./use-toggle-button.ts";
import type { ToggleButtonChangeEventDetails } from "./use-toggle-button.ts";
import styles from "./toggle-button.module.css";

export type { ToggleButtonChangeEventDetails } from "./use-toggle-button.ts";

export type ToggleButtonProps = Omit<ComponentProps<"button">, "type" | "value" | "children"> &
  InvokerCommands & {
    /**
     * Says what the button turns on, as its visible label, or shows an icon alone when `aria-label` or
     * `aria-labelledby` names the button.
     */
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
     * `lg` for prominent or spacious layouts, `sm` for dense ones.
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
 * as pressed. For an icon alone, name it with `aria-label`. Each change dispatches a bubbling
 * `ab-toggle`. Put several in a ToggleButtonGroup, or in a Toolbar, whose arrow keys then move
 * between them. To switch between views of the same content, use SegmentedControl; for a single
 * action, Button or IconButton.
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
  const { current, grouped, button } = useToggleButton({
    value,
    pressed,
    defaultPressed,
    onPressedChange,
    disabled,
    onClick,
  });

  return (
    <button
      {...mergeProps({ className: styles["root"], ...button }, props)}
      type="button"
      aria-pressed={current}
      data-size={size}
      data-grouped={grouped ? "" : undefined}
      data-icon-only={
        props["aria-label"] === undefined && props["aria-labelledby"] === undefined ? undefined : ""
      }
    >
      {props.children}
      <TouchTarget />
    </button>
  );
}
