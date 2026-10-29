import { getReferences } from "style-dictionary/utils";

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

/** The token `value` references when the whole value is one reference, such as `{semantic.color-text}`. */
export const referencedToken = (
  value: unknown,
  dictionary: Dictionary,
): TransformedToken | undefined => {
  if (typeof value !== "string") return undefined;

  const [target, ...more] = getReferences(value, dictionary.tokens, { warnImmediately: false });

  return more.length === 0 && value === `{${target?.path.join(".")}}` ? target : undefined;
};

export const valueIn = (
  token: TransformedToken,
  theme: ThemeId,
  dictionary: Dictionary,
): unknown => {
  const ownDark = theme === "dark" && isThemed(token);
  const authored: unknown = ownDark ? authoredDark(token) : token.original.$value;
  const target = referencedToken(authored, dictionary);

  if (target !== undefined) return valueIn(target, theme, dictionary);

  return ownDark ? resolvedDark(token) : token.$value;
};
