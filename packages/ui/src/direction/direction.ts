/**
 * The base direction of a BCP 47 tag, for `<html dir>` on the server. Reads `Intl.Locale`'s text
 * info; an invalid tag reads left to right.
 */
export function getDirection(locale: string): "ltr" | "rtl" {
  try {
    return new Intl.Locale(locale).getTextInfo().direction ?? "ltr";
  } catch {
    return "ltr";
  }
}
