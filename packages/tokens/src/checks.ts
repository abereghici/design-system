import type { Dictionary, TransformedToken } from "style-dictionary/types";

import { checkContrast } from "./contrast.ts";
import { checkName } from "./naming.ts";
import { authoredDark, isThemed, isWholeReference, THEME_EXTENSION } from "./theme.ts";
import { TIERS, tierOf, type Tier } from "./tiers.ts";

/** Thrown when a token set breaks the system's rules; `problems` lists every violation. */
export class TokenCheckError extends Error {
  readonly problems: readonly string[];

  constructor(problems: readonly string[]) {
    super(
      `Token checks failed (${problems.length}):\n${problems.map((p) => `  - ${p}`).join("\n")}`,
    );
    this.name = "TokenCheckError";
    this.problems = problems;
  }
}

/** The tier each tier may reference (R2, R3); primitive tokens hold literals only (R1). */
const REFERENCES: Record<Tier, Tier | undefined> = {
  primitive: undefined,
  semantic: "primitive",
  component: "semantic",
};

const REFERENCE = /\{[^\{\}]+\}/v;

/** Whether any string inside an authored value (including composite values) is a reference. */
const containsReference = (value: unknown): boolean => {
  if (typeof value === "string") return REFERENCE.test(value);
  if (typeof value === "object" && value !== null) {
    return Object.values(value).some((child) => containsReference(child));
  }
  return false;
};

const checkTier = (token: TransformedToken, dictionary: Dictionary): string[] => {
  const tier = tierOf(token);
  const label = `--${token.name}`;
  if (tier === undefined) {
    return [
      `${label}: top-level group "${String(token.path[0])}" is not a tier (${TIERS.join(", ")})`,
    ];
  }
  const allowed = REFERENCES[tier];
  const authored: unknown[] = [
    token.original.$value,
    ...(isThemed(token) ? [authoredDark(token)] : []),
  ];
  return authored.flatMap((value) => {
    if (allowed === undefined) {
      return containsReference(value)
        ? [`${label}: a primitive token must hold a literal, not reference another token`]
        : [];
    }
    if (!isWholeReference(value)) {
      return [`${label}: a ${tier} token must reference a ${allowed} token, not hold a literal`];
    }
    const target = dictionary.tokenMap.get(value);
    const targetTier = target === undefined ? undefined : tierOf(target);
    return targetTier === allowed
      ? []
      : [
          `${label}: a ${tier} token must reference a ${allowed} token, not a ${String(targetTier)} token`,
        ];
  });
};

const checkNaming = (token: TransformedToken): string[] => {
  const tier = tierOf(token);
  const problem = tier === undefined ? undefined : checkName(token.path.slice(1).join("-"), tier);
  return problem === undefined ? [] : [`--${token.name}: ${problem}`];
};

/** Semantic colors are resolved per Theme, except brand colors, which are fixed identity hues. */
const isThemedColor = (token: TransformedToken): boolean =>
  tierOf(token) === "semantic" &&
  token.$type === "color" &&
  token.path[1]?.startsWith("color-") === true &&
  !token.path[1].startsWith("color-brand-");

const checkThemes = (token: TransformedToken): string[] => {
  const label = `--${token.name}`;
  if (isThemedColor(token)) {
    return isThemed(token)
      ? []
      : [
          `${label}: a themed color needs a value for every Theme; missing: dark (add $extensions["${THEME_EXTENSION}"].dark)`,
        ];
  }
  if (!isThemed(token)) return [];
  if (tierOf(token) === "component") {
    return [
      `${label}: only semantic colors are themed; component tokens follow the semantic tokens they reference`,
    ];
  }
  return [`${label}: only semantic colors are themed; brand colors and other tokens are fixed`];
};

/** Every rule violation in the token set, as readable messages. Empty when the set is valid. */
export const checkTokens = (dictionary: Dictionary): string[] => {
  const problems = dictionary.allTokens.flatMap((token) => [
    ...checkTier(token, dictionary),
    ...checkNaming(token),
    ...checkThemes(token),
  ]);
  // Contrast is only meaningful once every color resolves as designed.
  return problems.length > 0 ? problems : checkContrast(dictionary);
};
