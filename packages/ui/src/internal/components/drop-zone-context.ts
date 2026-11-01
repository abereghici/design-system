import { createContext } from "react";
import type { RefObject } from "react";

/** The file input a DropZone holds, which the FileTrigger inside opens in place of its own. */
export interface DropZoneContextValue {
  readonly input: RefObject<HTMLInputElement | null>;
  readonly trigger: RefObject<HTMLElement | null>;
  readonly triggerId: string;
  readonly disabled: boolean;
}

export const DropZoneContext = createContext<DropZoneContextValue | undefined>(undefined);
