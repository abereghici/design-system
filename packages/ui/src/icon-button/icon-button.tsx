"use client";

import { Slot } from "@radix-ui/react-slot";
import { useState, type ComponentProps, type MouseEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import styles from "./icon-button.module.css";

export interface IconButtonChangeEventDetails {
  readonly reason: "none";
  readonly event: MouseEvent<HTMLButtonElement>;
  readonly cancel: () => void;
}

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type IconButtonProps = Omit<ComponentProps<"button">, "aria-label" | "aria-labelledby"> &
  AccessibleName & {
    /** 28 / 32 / 40 square, growing to 40 / 44 / 48 on coarse pointers. */
    size?: "sm" | "md" | "lg";
    /** Controlled toggle state. Setting `pressed` or `defaultPressed` makes it a toggle button. */
    pressed?: boolean;
    defaultPressed?: boolean;
    /** Called before the change commits; `details.cancel()` keeps the current state. */
    onPressedChange?: (pressed: boolean, details: IconButtonChangeEventDetails) => void;
    /** Busy: renders `aria-busy="true"` and blocks activation; focus stays. */
    loading?: boolean;
    /** Renders `aria-disabled="true"`: it stays focusable and announced, and activation is blocked. */
    disabled?: boolean;
    /** Renders the single child element (a link) with IconButton's props and styles. */
    asChild?: boolean;
  };

function changeEventDetails(
  event: MouseEvent<HTMLButtonElement>,
): [IconButtonChangeEventDetails, () => boolean] {
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  return [{ reason: "none", event, cancel }, () => cancelled];
}

/** Triggers an action with an icon instead of a text label. */
export function IconButton({
  size = "md",
  pressed,
  defaultPressed,
  onPressedChange,
  loading = false,
  disabled = false,
  asChild = false,
  className,
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
    const target = event.currentTarget;
    if (current === undefined) {
      dispatchFeedback(target, "ab-press", { component: "IconButton", reason: "user" });
      return;
    }
    const [details, cancelled] = changeEventDetails(event);
    onPressedChange?.(!current, details);
    if (cancelled()) return;
    setUncontrolled(!current);
    dispatchFeedback(target, "ab-toggle", { component: "IconButton", reason: "user" });
  }

  const Root = asChild ? Slot : "button";
  return (
    <Root
      {...props}
      type={asChild ? undefined : type}
      aria-pressed={current}
      aria-disabled={disabled ? true : undefined}
      aria-busy={loading ? true : undefined}
      data-loading={loading ? "" : undefined}
      data-size={size}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
      onClick={handleClick}
    />
  );
}
