"use client";

import type { ComponentProps, MouseEvent, PointerEvent as ReactPointerEvent } from "react";

import { useMenu } from "../internal/menu/menu.tsx";
import type { Menu } from "../internal/menu/menu.tsx";
import { rememberFocus } from "../internal/overlay/overlay.ts";
import { Slot, mergeProps } from "../internal/slot/slot.tsx";

import { place } from "./context-menu-root.tsx";

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

/** Runs `listener` on this press's next `type` event; the next press drops it if none came. */
function onceThisPress(type: "click" | "pointerup", listener: (event: Event) => void) {
  const controller = new AbortController();
  const { signal } = controller;
  const options = { capture: true, signal };

  document.addEventListener(
    type,
    (event) => {
      controller.abort();
      listener(event);
    },
    options,
  );
  document.addEventListener(
    "pointerdown",
    () => {
      controller.abort();
    },
    options,
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

  onceThisPress("click", (click) => {
    click.preventDefault();
    click.stopPropagation();
  });
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
function openFromContextMenu(event: MouseEvent<HTMLDivElement>, overlay: Menu["overlay"]) {
  const native = event.nativeEvent;
  const keyboard = isKeyboard(native);

  if (keyboard) rememberFocus(overlay.contentId);

  const target = event.target instanceof Element ? event.target : null;
  const source = keyboard ? target : anchorAt(overlay.contentId, event.clientX, event.clientY);
  const show = () => {
    overlay.toggle(true, "trigger-press", native, source);
  };

  if (event.buttons === 0) {
    show();

    return;
  }

  onceThisPress("pointerup", () => {
    setTimeout(show);
  });
}

/** The area that opens the menu. It keeps its own look. */
export function Trigger({ disabled = false, asChild = false, ...props }: TriggerProps) {
  const { overlay } = useMenu();
  const Area = asChild ? Slot : "div";
  const end = (event: ReactPointerEvent<HTMLDivElement>) => {
    endPress(event, (x, y) => {
      overlay.toggle(true, "trigger-press", event.nativeEvent, anchorAt(overlay.contentId, x, y));
    });
  };

  return (
    <Area
      {...mergeProps(
        {
          onContextMenu: (event: MouseEvent<HTMLDivElement>) => {
            if (disabled || event.defaultPrevented) return;

            event.preventDefault();

            if (presses.get(event.currentTarget)?.long !== true)
              openFromContextMenu(event, overlay);
          },
          onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
            if (disabled) return;

            if (!overlay.open) rememberFocus(overlay.contentId);

            if (event.pointerType !== "mouse") startPress(event);
          },
          onPointerMove: end,
          onPointerUp: end,
          onPointerCancel: end,
        },
        props,
      )}
      id={`${overlay.contentId}-area`}
      data-popup-open={overlay.open ? "" : undefined}
    />
  );
}
