import type { Dictionary, TransformedToken } from "style-dictionary/types";

/**
 * The `$extensions` key that holds a themed token's dark Theme value. The light Theme value
 * is the token's own `$value`, so light always comes first.
 *
 * ```json
 * "color-surface-default": {
 *   "$type": "color",
 *   "$value": "{primitive.palette-sage-0}",
 *   "$extensions": { "com.bereghici.theme": { "dark": "{primitive.palette-night-950}" } }
 * }
 * ```
 */
export const THEME_EXTENSION = "com.bereghici.theme";

export const THEMES = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const darkOf = (extensions: unknown): unknown => {
  if (typeof extensions !== "object" || extensions === null) return undefined;
  const entry: unknown = Reflect.get(extensions, THEME_EXTENSION);
  return typeof entry === "object" && entry !== null ? Reflect.get(entry, "dark") : undefined;
};

/** The dark value as authored (a reference such as `{primitive.palette-night-950}`). */
export const authoredDark = (token: TransformedToken): unknown =>
  darkOf(token.original["$extensions"]);

/** The dark value after Style Dictionary resolved and transformed it (e.g. `#12150f`). */
export const resolvedDark = (token: TransformedToken): unknown => darkOf(token["$extensions"]);

/** Whether the authored token carries its own per-Theme value. */
export const isThemed = (token: TransformedToken): boolean => authoredDark(token) !== undefined;

const WHOLE_REFERENCE = /^\{[^\{\}]+\}$/v;

/** Whether an authored value is exactly one reference, such as `{semantic.radius-sm}`. */
export const isWholeReference = (value: unknown): value is string =>
  typeof value === "string" && WHOLE_REFERENCE.test(value);

/**
 * The literal a token resolves to in a Theme. References are followed one hop at a time, so a
 * component token that points at a themed semantic token picks up that token's dark value.
 */
export const valueIn = (
  token: TransformedToken,
  theme: ThemeId,
  dictionary: Dictionary,
): unknown => {
  const ownDark = theme === "dark" && isThemed(token);
  const authored: unknown = ownDark ? authoredDark(token) : token.original.$value;
  const target = isWholeReference(authored) ? dictionary.tokenMap.get(authored) : undefined;
  if (target !== undefined) return valueIn(target, theme, dictionary);
  return ownDark ? resolvedDark(token) : token.$value;
};
