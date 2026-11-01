"use client";

import { createContext } from "react";
import type { MouseEvent } from "react";

export interface ToggleButtonGroupContextValue {
  readonly pressed: (value: string) => boolean;
  /** Answers whether the group accepted turning `value` on or off. */
  readonly toggle: (value: string, event: MouseEvent<HTMLButtonElement>) => boolean;
}

/** Lets a ToggleButtonGroup hold the pressed state of the ToggleButtons inside it. */
export const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextValue | null>(null);
