"use client";

import { createContext, use, useState } from "react";
import type { ComponentProps, KeyboardEvent } from "react";

import "@abereghici/tokens/components/splitter.css";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./splitter.module.css";

declare module "react" {
  interface CSSProperties {
    "--splitter-position"?: number;
  }
}

/** What moved the handle: a pointer drag, or a key on the focused handle. */
export type Reason = "drag" | "keyboard";

export type ChangeEventDetails = Details<Reason>;

export type RootProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  /** The first panel's size, as a percentage of the space, when your state holds it. */
  value?: number;
  /** The first panel's starting size, as a percentage, when it holds its own state. */
  defaultValue?: number;
  /** Called while the handle moves; `details.cancel()` keeps the previous size. */
  onValueChange?: (value: number, details: ChangeEventDetails) => void;
  /** The first panel's smallest size, as a percentage; Enter collapses it to this size. */
  min?: number;
  /** The first panel's largest size, as a percentage. */
  max?: number;
  /** How far an arrow key moves the handle, as a percentage. */
  step?: number;
  /** `"vertical"` stacks the panels, for a pane below the main content. */
  orientation?: "horizontal" | "vertical";
} & ({ value: number; defaultValue?: never } | { value?: never; defaultValue?: number });

export interface SplitterContextValue {
  readonly state: { readonly value: number };
  readonly actions: {
    /** Asks to move the handle to `raw`, kept within the range; answers whether it moved. */
    readonly resize: (raw: number, reason: Reason, event: Event) => boolean;
    /** Collapses the first panel to its smallest size, or restores the size it had. */
    readonly toggle: (event: KeyboardEvent<HTMLElement>) => void;
    readonly setDragging: (dragging: boolean) => void;
  };
  readonly meta: Required<Pick<RootProps, "min" | "max" | "step" | "orientation">>;
}

const SplitterContext = createContext<SplitterContextValue | null>(null);

export function useSplitter(part: string) {
  const splitter = use(SplitterContext);

  if (splitter === null) throw new Error(`Splitter.${part} must be inside Splitter.Root`);

  return splitter;
}

/**
 * Two panels side by side, or stacked, with a handle people drag to share the space between
 * them, as in a master-detail or editor layout. Compose `Splitter.Panel`, `Splitter.Handle` and
 * `Splitter.Panel`, and give the handle a name such as "Resize folders". On the focused handle,
 * the arrow keys move it, Home and End move it to the first panel's smallest and largest size, and
 * Enter collapses the first panel or restores it. Interactive after hydration (Tier 2): the panels
 * render at their size on the server, and the handle moves once the page's JavaScript has loaded.
 */
export function Root({
  value,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  ...props
}: RootProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value ?? uncontrolled;
  const [expanded, setExpanded] = useState(current);
  const [dragging, setDragging] = useState(false);

  function resize(raw: number, reason: Reason, event: Event) {
    const next = Math.min(Math.max(raw, min), max);

    if (next === current || !requestChange(onValueChange, next, reason, event)) return false;

    setUncontrolled(next);

    return true;
  }

  function toggle(event: KeyboardEvent<HTMLElement>) {
    const collapsing = current !== min;

    if (!resize(collapsing ? min : expanded, "keyboard", event.nativeEvent)) return;

    if (collapsing) setExpanded(current);

    dispatchFeedback(event.currentTarget, "ab-toggle", { component: "Splitter", reason: "user" });
  }

  return (
    <SplitterContext
      value={{
        state: { value: current },
        actions: { resize, toggle, setDragging },
        meta: { min, max, step, orientation },
      }}
    >
      <div
        {...mergeProps(
          { className: styles["root"], style: { "--splitter-position": current } },
          props,
        )}
        data-orientation={orientation}
        data-dragging={dragging ? "" : undefined}
      />
    </SplitterContext>
  );
}
