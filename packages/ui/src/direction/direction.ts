interface TextInfo {
  readonly direction?: "ltr" | "rtl";
}

// TypeScript's lib doesn't declare Intl Locale Info yet; engines before it shipped `getTextInfo()` (V8 before 13.0, so Node 22) expose the `textInfo` accessor.
type LocaleInfo = Intl.Locale & { getTextInfo?: () => TextInfo; textInfo?: TextInfo };

/**
 * The base direction of a BCP 47 tag, for `<html dir>` on the server. Reads `Intl.Locale`'s text
 * info; an invalid tag or an engine without it reads left to right.
 */
export function getDirection(locale: string): "ltr" | "rtl" {
  try {
    const info: LocaleInfo = new Intl.Locale(locale);
    return (info.getTextInfo?.() ?? info.textInfo)?.direction ?? "ltr";
  } catch {
    return "ltr";
  }
}
