import "./ui-provider.css";

import { preload } from "react-dom";
import type { ReactNode } from "react";

import { figtreeLatin } from "./figtree-latin.js";

export interface UIProviderProps {
  /** Your app. */
  children?: ReactNode;
}

/**
 * Mount it once around your app, in the root layout. It brings the styles and fonts every component
 * needs, so you import no CSS. It holds no state and ships no client code; interface text is yours,
 * passed to each component.
 */
export function UIProvider({ children }: UIProviderProps) {
  preload(figtreeLatin, { as: "font", type: "font/woff2" });

  return children;
}
