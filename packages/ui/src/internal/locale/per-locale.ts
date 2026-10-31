import { useLocale } from "./use-locale.ts";

/** A hook for what `build` makes from the app's locale, made once per locale. */
export function perLocale<Built>(build: (locale: string | undefined) => Built) {
  const cache = new Map<string, Built>();

  return function usePerLocale() {
    const locale = useLocale();
    const key = String(locale);
    const cached = cache.get(key) ?? build(locale);

    cache.set(key, cached);

    return cached;
  };
}
