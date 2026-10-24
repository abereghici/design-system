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

export function Provider({ locale, children }: ProviderProps) {
  preload(figtreeLatin, { as: "font", type: "font/woff2" });
  return locale === undefined ? (
    children
  ) : (
    <LocaleProvider value={locale}>{children}</LocaleProvider>
  );
}
