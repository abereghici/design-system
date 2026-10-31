import "./layers.css";
import "./ui-provider.css";

import { preload } from "react-dom";
import type { ReactNode } from "react";

// Imported from JS, not @import-ed in CSS, so the build keeps it in the tokens package where its font URLs resolve.
import "@abereghici/tokens/fonts.css";

import { LocaleProvider } from "../internal/locale/locale-provider.tsx";

import { figtreeLatin } from "./figtree-latin.js";

export interface UIProviderProps {
  /**
   * The language numbers and dates are formatted in, such as "ro-RO": pass your `<html lang>`.
   * Without it, each runtime uses its own default, so server and browser can disagree.
   */
  locale?: string | undefined;
  /** Your app. */
  children?: ReactNode;
}

/**
 * Mount it once around your app, in the root layout. It brings the styles and fonts every component
 * needs, so you import no CSS, and the language they format numbers and dates in. Interface text is
 * yours, passed to each component. For denser screens, set `data-density="compact"` on any element
 * to make the controls and collections inside it compact, and `"comfortable"` to go back; the nearest one wins.
 *
 * Tier 1: works before hydration.
 */
export function UIProvider({ locale, children }: UIProviderProps) {
  preload(figtreeLatin, { as: "font", type: "font/woff2" });

  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
