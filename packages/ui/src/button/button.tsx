"use client";

import { cloneElement, isValidElement } from "react";
import type { ComponentProps, MouseEvent, MouseEventHandler, ReactNode } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { Slot, mergeProps } from "../slot/slot.tsx";
import { Spinner } from "../spinner/spinner.tsx";

import styles from "./button.module.css";

export interface ButtonProps extends Omit<ComponentProps<"button">, "onClick"> {
  /** Runs on every press, unless the Button is disabled or loading. */
  onClick?: MouseEventHandler<HTMLElement> | undefined;
  /**
   * The weight of the action: one `primary` per view, `secondary` for the rest, `tertiary` in
   * toolbars and dense rows, `danger` only to confirm a destructive action.
   */
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  /**
   * `lg` for prominent or spacious layouts, `sm` for dense ones. Touch screens get larger targets
   * on their own.
   */
  size?: "sm" | "md" | "lg";
  /**
   * Shows a spinner and blocks presses while the action runs, keeping the label, width and focus.
   */
  loading?: boolean;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
  /** `submit` sends its form; the default, `button`, does nothing on its own. */
  type?: "button" | "submit" | "reset";
  /**
   * Gives the Button's look to its one child, such as a router link that should look like a button.
   */
  asChild?: boolean;
}

/**
 * Starts an action, such as saving or opening a dialog. It never submits a form unless you pass
 * `type="submit"`, and every press dispatches a bubbling `ab-press` event after `onClick`. For an
 * icon-only action, use IconButton; to go to another page, use Link.
 */
export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  asChild = false,
  type = "button",
  onClick,
  children,
  ...props
}: ButtonProps) {
  const blocked = disabled || loading;
  const spinner = loading ? <Spinner aria-hidden className={styles["spinner"]} /> : null;

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (blocked) {
      // preventDefault also stops a submit or reset button from acting on its form.
      event.preventDefault();

      return;
    }

    onClick?.(event);
    dispatchFeedback(event.currentTarget, "ab-press", { component: "Button", reason: "user" });
  }

  const Root = asChild ? Slot : "button";

  return (
    <Root
      {...mergeProps({ className: styles["root"] }, props)}
      type={asChild ? undefined : type}
      aria-disabled={blocked ? true : props["aria-disabled"]}
      aria-busy={loading ? true : undefined}
      data-loading={loading ? "" : undefined}
      data-variant={variant}
      data-size={size}
      onClick={handleClick}
    >
      {asChild ? (
        child(children, blocked, spinner)
      ) : (
        <>
          {children}
          {spinner}
        </>
      )}
    </Root>
  );
}

function child(children: ReactNode, blocked: boolean, spinner: ReactNode) {
  if (!blocked || !isValidElement<{ children?: ReactNode; onClick?: unknown }>(children)) {
    return children;
  }

  // Slot runs the child's own onClick before handleClick, so a blocked Button drops it here.
  return cloneElement(children, { onClick: undefined }, children.props.children, spinner);
}
