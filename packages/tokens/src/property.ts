import type { Dictionary, TransformedToken } from "style-dictionary/types";

import { THEMES, valueIn } from "./theme.ts";
import { tierOf } from "./tiers.ts";

// An unregistered custom property can't interpolate, so animated tokens get @property, with inherits: false so a change never restyles a whole subtree.
export const ANIMATED_EXTENSION = "com.bereghici.animated";

const SYNTAX: Readonly<Record<string, string>> = {
  color: "<color>",
  dimension: "<length>",
  duration: "<time>",
  number: "<number>",
};

export const isAnimated = (token: TransformedToken): boolean => {
  const extensions: unknown = token.original["$extensions"];
  return (
    typeof extensions === "object" &&
    extensions !== null &&
    Reflect.get(extensions, ANIMATED_EXTENSION) === true
  );
};

const INDEPENDENT = /^(?:-?[\d.]+(?:px|ms|s)?|#[0-9a-f]{6}|rgba\([\d., ]+\))$/iv;

export const checkAnimated = (token: TransformedToken, dictionary: Dictionary): string[] => {
  if (!isAnimated(token)) return [];
  const label = `--${token.name}`;
  if (tierOf(token) !== "component") {
    return [
      `${label}: only component tokens can be animated; a registered shared token with inherits: false would stop reaching the elements below it`,
    ];
  }
  if (SYNTAX[String(token.$type)] === undefined) {
    return [`${label}: a ${String(token.$type)} token can't be registered with @property`];
  }
  const [first, ...rest] = THEMES.map(({ id }) => String(valueIn(token, id, dictionary)));
  if (rest.some((value) => value !== first)) {
    return [
      `${label}: an animated token needs one value in every Theme; a registered property computes to one value and stops following the Theme`,
    ];
  }
  return INDEPENDENT.test(String(first))
    ? []
    : [
        `${label}: ${String(first)} is not computationally independent, so it can't be an @property initial-value`,
      ];
};

export const propertyRules = (
  tokens: readonly TransformedToken[],
  dictionary: Dictionary,
): string[] =>
  tokens
    .filter((token) => isAnimated(token))
    .flatMap((token) => [
      `@property --${token.name} {`,
      `  syntax: "${String(SYNTAX[String(token.$type)])}";`,
      "  inherits: false;",
      `  initial-value: ${String(valueIn(token, "light", dictionary))};`,
      "}",
      "",
    ]);
