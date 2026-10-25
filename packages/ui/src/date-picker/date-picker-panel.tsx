"use client";

import { createContext } from "react";
import type { RefObject } from "react";

import type { DatePickerContextValue } from "../date/date.ts";
import type { Floating } from "../floating/floating.ts";

export interface Panel {
  readonly floating: Floating;
  readonly picker: DatePickerContextValue;
  readonly name: string;
  readonly trigger: RefObject<HTMLButtonElement | null>;
}

export const PanelContext = createContext<Panel | null>(null);
