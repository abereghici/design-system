"use client";

import type { ComponentProps, MouseEvent, PointerEvent as ReactPointerEvent } from "react";

import { rememberFocus } from "../floating/floating.ts";
import type { Menu } from "../menu/menu.tsx";
import { Slot } from "../slot/slot.tsx";

import { place, useContextMenu } from "./context-menu-root.tsx";

const LONG_PRESS = 700;

const SLOP = 10;

export interface TriggerProps extends ComponentProps<"div"> {
  /** Lets the browser's own context menu open instead, such as while a row is being edited. */
  disabled?: boolean;
  /** Makes its one child the area, such as a table row or a card. */
  asChild?: boolean;
}

interface Press {
  readonly x: number;
  readonly y: number;
  readonly timer: ReturnType<typeof setTimeout>;
  long: boolean;
}

const presses = new WeakMap<Element, Press>();

function cancelNextClick() {
  document.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    },
    { capture: true, once: true },
  );
}

function startPress(event: ReactPointerEvent<HTMLDivElement>) {
  const press: Press = {
    x: event.clientX,
    y: event.clientY,
    long: false,
    timer: setTimeout(() => {
      press.long = true;
    }, LONG_PRESS),
  };
  presses.set(event.currentTarget, press);
}

/** Ends a touch or pen press; a long one opens the menu at the press point once released. */
function endPress(
  event: ReactPointerEvent<HTMLDivElement>,
  openAt: (x: number, y: number) => void,
) {
  const press = presses.get(event.currentTarget);
  if (press === undefined) return;
  const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y) > SLOP;
  if (event.type === "pointermove" && !moved) return;
  clearTimeout(press.timer);
  presses.delete(event.currentTarget);
  if (!press.long || event.type !== "pointerup") return;
  cancelNextClick();
  setTimeout(() => {
    openAt(press.x, press.y);
  });
}

const isKeyboard = (event: globalThis.MouseEvent) =>
  event instanceof PointerEvent ? event.pointerType === "" : event.button !== 2;

function anchorAt(contentId: string, x: number, y: number) {
  const anchor = document.getElementById(`${contentId}-anchor`);
  return anchor === null ? null : place(anchor, x, y, true);
}

/** Opens at the pointer, or below the focused element for the context-menu key, after release. */
function openFromContextMenu(event: MouseEvent<HTMLDivElement>, floating: Menu["floating"]) {
  const native = event.nativeEvent;
  const keyboard = isKeyboard(native);
  if (keyboard) rememberFocus(floating.contentId);
  const target = event.target instanceof Element ? event.target : null;
  const source = keyboard ? target : anchorAt(floating.contentId, event.clientX, event.clientY);
  const show = () => {
    floating.toggle(true, "trigger-press", native, source);
  };
  if (event.buttons === 0) {
    show();
    return;
  }
  document.addEventListener(
    "pointerup",
    () => {
      setTimeout(show);
    },
    { once: true },
  );
}

/** The area that opens the menu. It keeps its own look. */
export function Trigger({ disabled = false, asChild = false, ...props }: TriggerProps) {
  const { floating } = useContextMenu();
  const Area = asChild ? Slot : "div";
  const end = (event: ReactPointerEvent<HTMLDivElement>) => {
    endPress(event, (x, y) => {
      floating.toggle(true, "trigger-press", event.nativeEvent, anchorAt(floating.contentId, x, y));
    });
  };
  return (
    <Area
      {...props}
      id={`${floating.contentId}-area`}
      data-popup-open={floating.open ? "" : undefined}
      onContextMenu={(event: MouseEvent<HTMLDivElement>) => {
        props.onContextMenu?.(event);
        if (disabled || event.defaultPrevented) return;
        event.preventDefault();
        if (presses.get(event.currentTarget)?.long !== true) openFromContextMenu(event, floating);
      }}
      onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
        props.onPointerDown?.(event);
        if (disabled) return;
        if (!floating.open) rememberFocus(floating.contentId);
        if (event.pointerType !== "mouse") startPress(event);
      }}
      onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
        props.onPointerMove?.(event);
        end(event);
      }}
      onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
        props.onPointerUp?.(event);
        end(event);
      }}
      onPointerCancel={(event: ReactPointerEvent<HTMLDivElement>) => {
        props.onPointerCancel?.(event);
        end(event);
      }}
    />
  );
}
