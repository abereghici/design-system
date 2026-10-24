import "./provider.css";

import type { ReactNode } from "react";
import { preload } from "react-dom";

import { figtreeLatin } from "./figtree-latin.js";
import { LocaleProvider, type Locale } from "./locale.tsx";

export interface ProviderProps {
  /**
   * The language tag and built-in labels, from `@platform/ui/locales/*`. Without it, components
   * use the en-US labels and format in `document.documentElement.lang`.
   */
  locale?: Locale;
  children?: ReactNode;
}

/**
 * The app root: mount it once in the root layout. It brings the layer order, the shared tokens,
 * the fonts (preloading Figtree latin) and the base stylesheet, so apps import no CSS.
 */
export function Provider({ locale, children }: ProviderProps) {
  preload(figtreeLatin, { as: "font", type: "font/woff2" });
  return locale === undefined ? (
    children
  ) : (
    <LocaleProvider value={locale}>{children}</LocaleProvider>
  );
}
