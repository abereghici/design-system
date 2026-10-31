"use client";

import type { ComponentProps, KeyboardEvent, PointerEvent } from "react";

import "@abereghici/tokens/components/splitter.css";

import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import { useLocale } from "../internal/locale/use-locale.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import { useSplitter } from "./splitter-root.tsx";
import type { SplitterContextValue } from "./splitter-root.tsx";
import styles from "./splitter.module.css";

export type HandleProps = Omit<ComponentProps<"hr">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

// The handle sits between the panels, so the panel before it is the one it resizes.
function controlPrevious(handle: HTMLHRElement | null) {
  if (handle?.previousElementSibling) handle.ariaControlsElements = [handle.previousElementSibling];
}

function keyTarget(event: KeyboardEvent<HTMLHRElement>, { state, meta }: SplitterContextValue) {
  const { value } = state;
  const { step } = meta;
  const flip = event.currentTarget.matches(":dir(rtl)") ? -1 : 1;
  const arrow =
    meta.orientation === "horizontal"
      ? { ArrowLeft: value - flip * step, ArrowRight: value + flip * step }[event.key]
      : { ArrowUp: value - step, ArrowDown: value + step }[event.key];

  return arrow ?? { Home: meta.min, End: meta.max }[event.key];
}

function positionAt(event: PointerEvent<HTMLHRElement>, horizontal: boolean) {
  const handle = event.currentTarget.getBoundingClientRect();
  const root = event.currentTarget.parentElement?.getBoundingClientRect() ?? handle;

  if (!horizontal) {
    return ((event.clientY - root.top - handle.height / 2) / (root.height - handle.height)) * 100;
  }

  const offset = event.currentTarget.matches(":dir(rtl)")
    ? root.right - event.clientX
    : event.clientX - root.left;

  return ((offset - handle.width / 2) / (root.width - handle.width)) * 100;
}

/** The line between the panels that people drag, or focus and move with the keyboard. */
export function Handle(props: HandleProps) {
  const splitter = useSplitter("Handle");
  const { state, actions, meta } = splitter;
  const horizontal = meta.orientation === "horizontal";
  const percent = new Intl.NumberFormat(useLocale(), {
    style: "percent",
    maximumFractionDigits: 0,
  });

  const own = {
    className: styles["handle"],
    ref: controlPrevious,
    onKeyDown: (event: KeyboardEvent<HTMLHRElement>) => {
      const next = event.key === "Enter" ? null : keyTarget(event, splitter);

      if (next === undefined) return;

      event.preventDefault();

      if (next === null) actions.toggle(event);
      else actions.resize(next, "keyboard", event.nativeEvent);
    },
    onPointerDown: (event: PointerEvent<HTMLHRElement>) => {
      if (event.button !== 0) return;

      // Keeps a drag from selecting the panels' text; the handle still takes focus.
      event.preventDefault();
      event.currentTarget.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      actions.setDragging(true);
    },
    onPointerMove: (event: PointerEvent<HTMLHRElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

      actions.resize(positionAt(event, horizontal), "drag", event.nativeEvent);
    },
    onLostPointerCapture: () => {
      actions.setDragging(false);
    },
  };

  return (
    <hr
      {...mergeProps(own, props)}
      tabIndex={0}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={state.value}
      aria-valuetext={percent.format(state.value / 100)}
      aria-valuemin={meta.min}
      aria-valuemax={meta.max}
    />
  );
}
