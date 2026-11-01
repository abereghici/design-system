/**
 * The direction a language's text runs in, for a BCP 47 tag such as `"ar-EG"`: `"rtl"` or `"ltr"`.
 * Set it as `<html dir>` in the root layout, beside `<html lang>` and `UIProvider`'s `locale`, so
 * the server renders right-to-left languages mirrored. An invalid tag reads left to right.
 */
export function getTextDirection(locale: string): "ltr" | "rtl" {
  try {
    return new Intl.Locale(locale).getTextInfo().direction ?? "ltr";
  } catch {
    return "ltr";
  }
}
