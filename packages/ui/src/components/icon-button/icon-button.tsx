"use client";

import "@abereghici/tokens/components/icon-button.css";

import type { ComponentProps } from "react";

import { useButton } from "../../internal/interactions/use-button.ts";
import type { AccessibleName } from "../../internal/types/accessible-name.ts";
import type { InvokerCommands } from "../../internal/types/invoker-commands.ts";
import { chain } from "../../internal/utils/chain.ts";
import { dispatchFeedback } from "../../internal/utils/dispatch-feedback.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";
import { Spinner } from "../spinner/spinner.tsx";

import styles from "./icon-button.module.css";

export type IconButtonProps = Omit<ComponentProps<"button">, "aria-label" | "aria-labelledby"> &
  AccessibleName &
  InvokerCommands & {
    /**
     * `lg` for prominent or spacious layouts, `sm` for dense ones. Touch screens get larger targets
     * on their own.
     */
    size?: "sm" | "md" | "lg";
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

/**
 * An action shown as an icon alone, for toolbars and tight rows. Give it a name with `aria-label`
 * (or `aria-labelledby`), since the icon says nothing to a screen reader. A press dispatches
 * `ab-press`. For an icon that stays on or off, such as Pin or Bold, use a ToggleButton; use a
 * Button with a visible label whenever space allows.
 *
 * Tier 1: works before hydration.
 */
export function IconButton({
  size = "md",
  loading = false,
  disabled = false,
  asChild = false,
  type = "button",
  onClick,
  ...props
}: IconButtonProps) {
  const button = useButton<HTMLButtonElement>({
    disabled: disabled || loading,
    onClick: chain(onClick, (event) => {
      dispatchFeedback(event.currentTarget, "ab-press", {
        component: "IconButton",
        userInitiated: true,
      });
    }),
  });
  const Root = asChild ? Slot : "button";

  return (
    <Root
      {...mergeProps({ className: styles["root"], ...button }, props)}
      type={asChild ? undefined : type}
      aria-busy={loading ? true : undefined}
      data-loading={loading ? "" : undefined}
      data-size={size}
    >
      {loading && !asChild ? <Spinner aria-hidden /> : props.children}
    </Root>
  );
}
