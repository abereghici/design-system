import type { Dictionary, TransformedToken } from "style-dictionary/types";

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

export const authoredDark = (token: TransformedToken): unknown =>
  darkOf(token.original["$extensions"]);

export const resolvedDark = (token: TransformedToken): unknown => darkOf(token["$extensions"]);

export const isThemed = (token: TransformedToken): boolean => authoredDark(token) !== undefined;

const WHOLE_REFERENCE = /^\{[^\{\}]+\}$/v;

export const isWholeReference = (value: unknown): value is string =>
  typeof value === "string" && WHOLE_REFERENCE.test(value);

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
