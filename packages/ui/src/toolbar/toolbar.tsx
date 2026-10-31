"use client";

import type { ComponentProps, FocusEvent, KeyboardEvent } from "react";

import "@abereghici/tokens/components/toolbar.css";

import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./toolbar.module.css";

export type ToolbarProps = Omit<ComponentProps<"div">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

const steps: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

function items(root: HTMLElement) {
  return [
    ...root.querySelectorAll<HTMLElement>('button, a[href], input:not([type="hidden"])'),
  ].filter((item) => !item.matches(":disabled") && item.closest("[popover]") === null);
}

function rove(root: HTMLElement, stop?: EventTarget) {
  const list = items(root);
  const current =
    list.find((item) => item === stop) ??
    list.find((item) => item.getAttribute("tabindex") === "0") ??
    list.find((item) => item.getAttribute("aria-disabled") !== "true");

  for (const item of list) item.tabIndex = item === current ? 0 : -1;
}

function connect(root: HTMLDivElement) {
  const observer = new MutationObserver(() => {
    rove(root);
  });

  observer.observe(root, { childList: true, subtree: true });
  rove(root);

  return () => {
    observer.disconnect();
  };
}

function destination(event: KeyboardEvent<HTMLDivElement>) {
  const list = items(event.currentTarget);
  const index = list.findIndex((item) => item === event.target);
  const offset = { ...steps, Home: -index, End: list.length - 1 - index }[event.key];

  if (index === -1 || offset === undefined) return null;

  const mirrored =
    event.currentTarget.matches(":dir(rtl)") &&
    (event.key === "ArrowLeft" || event.key === "ArrowRight");

  return list.at((index + (mirrored ? -offset : offset)) % list.length) ?? null;
}

function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
  // A control inside (a SegmentedControl, a Slider) already handled the arrow key.
  if (event.defaultPrevented) return;

  const target = destination(event);

  if (target === null) return;

  event.preventDefault();
  target.focus();
}

function handleFocus(event: FocusEvent<HTMLDivElement>) {
  rove(event.currentTarget, event.target);
}

/**
 * Groups three or more related controls (IconButtons, Buttons, a SegmentedControl) into one Tab
 * stop, so keyboard users skip the group in one press; the arrow keys move between them. Name it
 * with `aria-label`. For one or two controls, place them directly; never put text fields, Selects or
 * Sliders inside, since they need the arrow keys themselves.
 *
 * Tier 1: works before hydration, except moving with the arrow keys (Tier 2), which works after it.
 */
export function Toolbar(props: ToolbarProps) {
  return (
    <div
      {...mergeProps(
        {
          role: "toolbar",
          tabIndex: -1,
          ref: connect,
          className: styles["root"],
          onKeyDown: handleKeyDown,
          onFocus: handleFocus,
        },
        props,
      )}
    />
  );
}
