import "./ui-provider.css";

import { preload } from "react-dom";
import type { ReactNode } from "react";

import { figtreeLatin } from "./figtree-latin.js";
import { LocaleProvider } from "./locale.tsx";
import type { Locale } from "./locale.tsx";

export interface UIProviderProps {
  /**
   * The app's language, from `@platform/ui/locales/*`, for every built-in label and number format.
   * Without it components use en-US.
   */
  locale?: Locale;
  /** Your app. */
  children?: ReactNode;
}

/**
 * Mount it once around your app, in the root layout. It brings the styles and fonts every component
 * needs, so you import no CSS, and the `locale` for built-in labels.
 */
export function UIProvider({ locale, children }: UIProviderProps) {
  preload(figtreeLatin, { as: "font", type: "font/woff2" });
  return locale === undefined ? (
    children
  ) : (
    <LocaleProvider value={locale}>{children}</LocaleProvider>
  );
}
