"use client";

import type { ComponentProps, FocusEvent, KeyboardEvent, Ref } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./toolbar.module.css";

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

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

function connect(root: HTMLDivElement, ref: Ref<HTMLDivElement> | undefined) {
  const observer = new MutationObserver(() => {
    rove(root);
  });
  observer.observe(root, { childList: true, subtree: true });
  rove(root);
  const cleanup = typeof ref === "function" ? ref(root) : undefined;
  if (ref && typeof ref === "object") ref.current = root;
  return () => {
    observer.disconnect();
    if (typeof cleanup === "function") cleanup();
    else if (typeof ref === "function") ref(null);
    else if (ref) ref.current = null;
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

/**
 * Groups three or more related controls (IconButtons, Buttons, a SegmentedControl) into one tab
 * stop; the arrow keys move between them, wrapping at the ends and following the visual direction
 * in RTL. Disabled controls stay reachable. For one or two controls, place them directly; never put
 * text fields, Selects or Sliders inside.
 */
export function Toolbar({ ref, className, onKeyDown, onFocus, ...props }: ToolbarProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    // A control inside (a SegmentedControl, a Slider) already handled the arrow key.
    if (event.defaultPrevented) return;
    const target = destination(event);
    if (target === null) return;
    event.preventDefault();
    target.focus();
  }

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    onFocus?.(event);
    rove(event.currentTarget, event.target);
  }

  return (
    <div
      role="toolbar"
      tabIndex={-1}
      {...props}
      ref={(root) => (root === null ? undefined : connect(root, ref))}
      className={join(styles["root"], className)}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    />
  );
}
