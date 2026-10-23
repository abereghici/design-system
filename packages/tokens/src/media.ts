import type { TransformedToken } from "style-dictionary/types";

/**
 * The `$extensions` key for a token's media overrides: a map from a media query to the value
 * the token takes while it matches. Values are references, as for `$value`; a themed color
 * can give one per Theme as `{ "light": …, "dark": … }`.
 *
 * ```json
 * "space-section": {
 *   "$type": "dimension",
 *   "$value": "{primitive.dimension-88}",
 *   "$extensions": { "com.bereghici.media": { "(width < 760px)": "{primitive.dimension-64}" } }
 * }
 * ```
 */
export const MEDIA_EXTENSION = "com.bereghici.media";

export interface MediaOverride {
  readonly query: string;
  /** A reference, or `{ light, dark }` references for a themed color. */
  readonly value: unknown;
}

/** The token's media overrides as authored, in source order. */
export const mediaOverrides = (token: TransformedToken): MediaOverride[] => {
  const extensions: unknown = token.original["$extensions"];
  if (typeof extensions !== "object" || extensions === null) return [];
  const overrides: unknown = Reflect.get(extensions, MEDIA_EXTENSION);
  if (typeof overrides !== "object" || overrides === null) return [];
  return Object.keys(overrides).map((query) => {
    const value: unknown = Reflect.get(overrides, query);
    return { query, value };
  });
};

/** The `light` and `dark` members of a per-Theme override, or `undefined` for a plain one. */
export const perTheme = (
  value: unknown,
): { readonly light: unknown; readonly dark: unknown } | undefined =>
  typeof value === "object" && value !== null && "light" in value && "dark" in value
    ? { light: value.light, dark: value.dark }
    : undefined;
