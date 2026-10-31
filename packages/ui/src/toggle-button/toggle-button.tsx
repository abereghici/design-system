"use client";

import { use } from "react";
import type { ComponentProps, MouseEvent, ReactNode } from "react";

import "@abereghici/tokens/components/toggle-button.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import { chain } from "../internal/chain/chain.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import type { InvokerCommands } from "../internal/invoker-commands/invoker-commands.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";
import { useButton } from "../internal/use-button/use-button.ts";
import { ToggleButtonGroupContext } from "../toggle-button-group/toggle-button-group-context.ts";

import styles from "./toggle-button.module.css";

export type ToggleButtonChangeEventDetails = Details<"none", MouseEvent<HTMLButtonElement>>;

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
  const group = use(ToggleButtonGroupContext);
  const [own, request] = useControllableState(pressed, defaultPressed ?? false, onPressedChange);
  const current = group?.pressed(value) ?? own;

  const button = useButton<HTMLButtonElement>({
    disabled,
    onClick: chain(onClick, (event) => {
      if (group === null) {
        if (!request(!current, "none", event)) return;
      } else if (!group.toggle(value, event)) return;

      dispatchFeedback(event.currentTarget, "ab-toggle", {
        component: "ToggleButton",
        userInitiated: true,
      });
    }),
  });

  return (
    <button
      {...mergeProps({ className: styles["root"], ...button }, props)}
      type="button"
      aria-pressed={current}
      data-size={size}
      data-icon-only={
        props["aria-label"] === undefined && props["aria-labelledby"] === undefined ? undefined : ""
      }
    />
  );
}
