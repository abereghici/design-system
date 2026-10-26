import type { TransformedToken } from "style-dictionary/types";

export const TIERS = ["primitive", "semantic", "component"] as const;

export type Tier = (typeof TIERS)[number];

export const tierOf = (token: TransformedToken): Tier | undefined =>
  TIERS.find((tier) => tier === token.path[0]);

const rank = (token: TransformedToken): number => {
  const tier = tierOf(token);

  return tier === undefined ? TIERS.length : TIERS.indexOf(tier);
};

export const inTierOrder = (tokens: readonly TransformedToken[]): TransformedToken[] =>
  tokens.toSorted((a, b) => rank(a) - rank(b));
