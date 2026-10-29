"use client";

import { createContext } from "react";
import type { RefObject } from "react";

import type { DatePickerContextValue } from "../internal/date/date.ts";
import type { Overlay } from "../internal/overlay/overlay.ts";

export interface Panel {
  readonly overlay: Overlay;
  readonly picker: DatePickerContextValue;
  readonly name: string;
  readonly trigger: RefObject<HTMLButtonElement | null>;
}

export const PanelContext = createContext<Panel | null>(null);
