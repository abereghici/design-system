import "./provider.css";

import { preload } from "react-dom";
import type { ReactNode } from "react";

import { figtreeLatin } from "./figtree-latin.js";
import { LocaleProvider } from "./locale.tsx";
import type { Locale } from "./locale.tsx";

export interface ProviderProps {
  /**
   * The language tag and built-in labels, from `@platform/ui/locales/*`. Without it, client
   * components use en-US, as Server Components do without their own `locale`.
   */
  locale?: Locale;
  children?: ReactNode;
}

/**
 * The app root: mount it once in the root layout. It brings the layer order, the shared tokens, the
 * fonts (preloading Figtree latin) and the base stylesheet, so apps import no CSS, and it passes
 * the `locale` to client components.
 */
export function Provider({ locale, children }: ProviderProps) {
  preload(figtreeLatin, { as: "font", type: "font/woff2" });
  return locale === undefined ? (
    children
  ) : (
    <LocaleProvider value={locale}>{children}</LocaleProvider>
  );
}
