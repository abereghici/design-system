import type { TransformedToken } from "style-dictionary/types";

export const MEDIA_EXTENSION = "com.bereghici.media";

interface MediaOverride {
  readonly query: string;
  readonly value: unknown;
}

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

export const perTheme = (
  value: unknown,
): { readonly light: unknown; readonly dark: unknown } | undefined =>
  typeof value === "object" && value !== null && "light" in value && "dark" in value
    ? { light: value.light, dark: value.dark }
    : undefined;
