import { useLocale } from "./use-locale.ts";

/** A hook for what `build` makes from the app's locale and the hook's arguments, made once per locale and arguments. */
export function perLocale<Built, Args extends unknown[] = []>(
  build: (locale: string | undefined, ...args: Args) => Built,
) {
  const cache = new Map<string, Built>();

  return function usePerLocale(...args: Args) {
    const locale = useLocale();
    const key = `${String(locale)} ${JSON.stringify(args)}`;
    const cached = cache.get(key) ?? build(locale, ...args);

    cache.set(key, cached);

    return cached;
  };
}
