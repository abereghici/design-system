"use client";

import { createContext } from "react";
import type { RefObject } from "react";

import type { Overlay } from "../internal/overlay/overlay.ts";

export interface Panel {
  readonly overlay: Overlay;
  readonly name: string;
  readonly trigger: RefObject<HTMLButtonElement | null>;
}

export const PanelContext = createContext<Panel | null>(null);

/** Whether focus is still where the open left it (the trigger, the panel or nowhere). */
export const focusStayed = (overlay: Overlay) => {
  const focus = document.activeElement;

  return (
    focus === document.body ||
    focus?.getAttribute("commandfor") === overlay.contentId ||
    document.getElementById(overlay.contentId)?.contains(focus) === true
  );
};
