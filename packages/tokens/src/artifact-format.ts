import type { Dictionary, TransformedToken } from "style-dictionary/types";

import { THEMES, valueIn } from "./theme.ts";
import { inTierOrder } from "./tiers.ts";

/**
 * The claude.ai Design System artifact's `tokens.json` shape, read by `/design-sync`: every
 * family is a flat list of `{ name, value, usage }`, colors carry their Themes (light first),
 * and every value is a literal (no `var()`, `light-dark()`, `color-mix()` or named colors).
 */
export interface ArtifactEntry<Value> {
  readonly name: string;
  readonly value: Value;
  readonly usage: string;
}

/** A plain string is the first Theme's value; every other Theme inherits it. */
export type ThemedColor = string | { readonly light: string; readonly dark: string };

export interface ArtifactTokens {
  readonly name: string;
  readonly version: 1;
  readonly color: {
    readonly themes: typeof THEMES;
    readonly tokens: readonly ArtifactEntry<ThemedColor>[];
  };
  readonly spacing: { readonly tokens: readonly ArtifactEntry<string>[] };
  readonly radius: { readonly tokens: readonly ArtifactEntry<string>[] };
}

type Family = "color" | "spacing" | "radius";

/** Lengths that belong to the type and material families, which this format doesn't list yet. */
const NOT_SPACING = /font-size|letter-spacing|blur/v;

/** `$type`s the artifact has no family for here yet (type, motion, shadow; see #14). */
const UNLISTED = new Set([
  "cubicBezier",
  "duration",
  "fontFamily",
  "fontWeight",
  "number",
  "shadow",
  "string",
  "typography",
]);

/**
 * Which artifact family a token is listed in, or `undefined` when it is deliberately left out.
 * An unknown `$type` throws, so a new one has to be mapped here on purpose.
 */
const familyOf = (token: TransformedToken): Family | undefined => {
  if (token.$type === "color") return "color";
  if (token.$type === "dimension") {
    if (NOT_SPACING.test(token.name)) return undefined;
    return token.name.includes("radius") ? "radius" : "spacing";
  }
  if (UNLISTED.has(String(token.$type))) return undefined;
  throw new Error(
    `--${token.name}: no artifact family for $type "${String(token.$type)}" (see src/artifact-format.ts)`,
  );
};

const entry = <Value>(token: TransformedToken, value: Value): ArtifactEntry<Value> => ({
  name: token.name,
  value,
  usage: token.$description ?? "",
});

const themedColor = (token: TransformedToken, dictionary: Dictionary): ThemedColor => {
  const light = String(valueIn(token, "light", dictionary));
  const dark = String(valueIn(token, "dark", dictionary));
  return light === dark ? light : { light, dark };
};

/** The artifact-shaped tokens for a checked, transformed dictionary. */
export const toArtifactTokens = (dictionary: Dictionary): ArtifactTokens => {
  const byFamily = Map.groupBy(inTierOrder(dictionary.allTokens), (token) => familyOf(token));
  const listed = (family: Family) => byFamily.get(family) ?? [];
  // `Map.groupBy` keys the left-out tokens under `undefined`; `listed` never reads that group.
  return {
    name: "Bereghici Design System",
    version: 1,
    color: {
      themes: THEMES,
      tokens: listed("color").map((token) => entry(token, themedColor(token, dictionary))),
    },
    spacing: { tokens: listed("spacing").map((token) => entry(token, String(token.$value))) },
    radius: { tokens: listed("radius").map((token) => entry(token, String(token.$value))) },
  };
};
