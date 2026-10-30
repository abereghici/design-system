"use client";

import { useState } from "react";
import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/icon-button.css";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { Slot, mergeProps } from "../internal/slot/slot.tsx";
import { Spinner } from "../spinner/spinner.tsx";

import styles from "./icon-button.module.css";

export type IconButtonChangeEventDetails = Details<"none", MouseEvent<HTMLButtonElement>>;

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type IconButtonProps = Omit<ComponentProps<"button">, "aria-label" | "aria-labelledby"> &
  AccessibleName & {
    /**
     * `lg` for prominent or spacious layouts, `sm` for dense ones. Touch screens get larger targets
     * on their own.
     */
    size?: "sm" | "md" | "lg";
    /** Makes it a toggle that stays on or off, such as Pin or Bold, held by your state. */
    pressed?: boolean;
    /** Makes it a toggle that holds its own on or off state, starting with this one. */
    defaultPressed?: boolean;
    /** Called before the change commits; `details.cancel()` keeps the current state. */
    onPressedChange?: (pressed: boolean, details: IconButtonChangeEventDetails) => void;
    /** Shows a spinner and blocks presses while the action runs, keeping focus. */
    loading?: boolean;
    /**
     * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
     * nearby why it is unavailable.
     */
    disabled?: boolean;
    /** `submit` sends its form; the default, `button`, does nothing on its own. */
    type?: "button" | "submit" | "reset";
    /** Gives the IconButton's look to its one child, such as a link. */
    asChild?: boolean;
  };

const feedback = { component: "IconButton", reason: "user" } as const;

/**
 * An action shown as an icon alone, for toolbars and tight rows. Give it a name with `aria-label`
 * (or `aria-labelledby`), since the icon says nothing to a screen reader. With `pressed` or
 * `defaultPressed` it is a toggle. A press dispatches `ab-press`, a toggle `ab-toggle`. Use a Button
 * with a visible label whenever space allows.
 */
export function IconButton({
  size = "md",
  pressed,
  defaultPressed,
  onPressedChange,
  loading = false,
  disabled = false,
  asChild = false,
  type = "button",
  onClick,
  ...props
}: IconButtonProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultPressed);
  const current = pressed ?? uncontrolled;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (disabled || loading) {
      event.preventDefault();

      return;
    }

    onClick?.(event);

    if (current === undefined) {
      dispatchFeedback(event.currentTarget, "ab-press", feedback);

      return;
    }

    if (!requestChange(onPressedChange, !current, "none", event)) return;

    setUncontrolled(!current);
    dispatchFeedback(event.currentTarget, "ab-toggle", feedback);
  }

  const Root = asChild ? Slot : "button";

  return (
    <Root
      {...mergeProps({ className: styles["root"] }, props)}
      type={asChild ? undefined : type}
      aria-pressed={current}
      aria-disabled={disabled ? true : undefined}
      aria-busy={loading ? true : undefined}
      data-loading={loading ? "" : undefined}
      data-size={size}
      onClick={handleClick}
    >
      {loading && !asChild ? <Spinner aria-hidden /> : props.children}
    </Root>
  );
}
