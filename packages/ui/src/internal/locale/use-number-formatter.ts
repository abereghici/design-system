import { perLocale } from "./per-locale.ts";

/** An `Intl.NumberFormat` in the app's locale, built once per locale and options and then shared. */
export const useNumberFormatter = perLocale(
  (locale: string | undefined, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, options),
);
