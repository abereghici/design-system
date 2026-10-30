import type { Dictionary, TransformedToken } from "style-dictionary/types";

import { declaredValue, overrideValue } from "./css-format.ts";
import { mediaOverrides } from "./media.ts";
import { componentOf } from "./naming.ts";
import { inTierOrder, tierOf } from "./tiers.ts";
import type { Tier } from "./tiers.ts";

/** One token as the docs show it: what it is, how the CSS declares it, and when that changes. */
export interface CatalogToken {
  readonly name: string;
  readonly tier: Tier;
  /** The family of a primitive or semantic token; the component of a component token. */
  readonly group: string;
  readonly type: string;
  readonly description: string;
  readonly value: string;
  readonly conditions: readonly { readonly query: string; readonly value: string }[];
}

const FAMILIES: readonly (readonly [RegExp, string])[] = [
  [/^ab-(?:palette|color)-/v, "Color"],
  [/^ab-(?:type|font|line-height|letter-spacing|text-transform)-/v, "Typography"],
  [/^ab-space-/v, "Space"],
  [/^ab-dimension-/v, "Dimension"],
  [/^ab-size-/v, "Size"],
  [/^ab-(?:radius|border-width|focus-ring|underline|stroke-width)-/v, "Shape"],
  [/^ab-(?:elevation|material|blur|saturate)-/v, "Elevation"],
  [/^ab-opacity-/v, "Opacity"],
  [/^ab-(?:motion|duration|easing|scale)-/v, "Motion"],
  [/^ab-(?:layout|breakpoint|z-index)-/v, "Layout"],
];

// An unmapped token throws, so a new kind of token is given a family here on purpose.
const groupOf = (token: TransformedToken, tier: Tier): string => {
  if (tier === "component") return String(componentOf(token.path.slice(1).join("-")));

  const family = FAMILIES.find(([pattern]) => pattern.test(token.name))?.[1];

  if (family === undefined)
    throw new Error(`--${token.name}: no catalog family (see src/catalog.ts)`);

  return family;
};

export const catalogOf = (dictionary: Dictionary): CatalogToken[] =>
  inTierOrder(dictionary.allTokens).map((token) => {
    const tier = tierOf(token) ?? "primitive";

    return {
      name: token.name,
      tier,
      group: groupOf(token, tier),
      type: String(token.$type),
      description: token.$description ?? "",
      value: declaredValue(token, dictionary),
      conditions: mediaOverrides(token).map(({ query, value }) => ({
        query,
        value: overrideValue(token, value, dictionary),
      })),
    };
  });
