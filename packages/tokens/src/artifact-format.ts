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

/** Which artifact family a token is listed in; add a branch here when a new `$type` lands. */
const familyOf = (token: TransformedToken): Family => {
  if (token.$type === "color") return "color";
  if (token.$type === "dimension") return token.name.includes("radius") ? "radius" : "spacing";
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
