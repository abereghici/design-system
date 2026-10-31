import { useLocale } from "./use-locale.ts";

const formatters = new Map<string, Intl.NumberFormat>();

/** An `Intl.NumberFormat` in the app's locale, built once per locale and options and then shared. */
export function useNumberFormatter(options?: Intl.NumberFormatOptions) {
  const locale = useLocale();
  const key = `${String(locale)} ${JSON.stringify(options)}`;
  const formatter = formatters.get(key) ?? new Intl.NumberFormat(locale, options);

  formatters.set(key, formatter);

  return formatter;
}
