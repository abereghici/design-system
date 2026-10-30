import { usesReferences } from "style-dictionary/utils";

import type { Dictionary, TransformedToken } from "style-dictionary/types";

import { allowsSemanticMember, isComposite, leavesOf } from "./composite.ts";
import { checkContrast } from "./contrast.ts";
import { mediaOverrides, perTheme } from "./media.ts";
import { checkName } from "./naming.ts";
import { checkAnimated } from "./property.ts";
import { authoredDark, isThemed, referencedToken, THEME_EXTENSION } from "./theme.ts";
import { TIERS, tierOf } from "./tiers.ts";
import type { Tier } from "./tiers.ts";

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

const REFERENCES: Record<Tier, Tier | undefined> = {
  primitive: undefined,
  semantic: "primitive",
  component: "semantic",
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
      return usesReferences(value)
        ? [`${label}: a primitive token must hold a literal, not reference another token`]
        : [];
    }

    const members =
      tier === "semantic" && isComposite(value)
        ? leavesOf(value).filter((leaf) => typeof leaf !== "boolean")
        : [value];

    return [...new Set(members.flatMap((member) => checkReference(token, member, dictionary)))];
  });
};

const checkReference = (
  token: TransformedToken,
  value: unknown,
  dictionary: Dictionary,
): string[] => {
  const tier = tierOf(token);
  const allowed = tier === undefined ? undefined : REFERENCES[tier];
  const label = `--${token.name}`;

  const target = referencedToken(value, dictionary);

  if (target === undefined) {
    return [
      `${label}: a ${String(tier)} token must reference a ${String(allowed)} token, not hold a literal`,
    ];
  }

  const targetTier = tierOf(target);

  if (targetTier === allowed) return [];

  const targetName = target.path.slice(1).join("-");

  if (targetTier === "semantic" && allowsSemanticMember(token.$type, targetName)) return [];

  return [
    `${label}: a ${String(tier)} token must reference a ${String(allowed)} token, not a ${String(targetTier)} token`,
  ];
};

const checkNaming = (token: TransformedToken): string[] => {
  const tier = tierOf(token);
  const problem = tier === undefined ? undefined : checkName(token.path.slice(1).join("-"), tier);

  return problem === undefined ? [] : [`--${token.name}: ${problem}`];
};

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

const checkMedia = (token: TransformedToken, dictionary: Dictionary): string[] => {
  const overrides = mediaOverrides(token);
  const label = `--${token.name}`;

  if (overrides.length === 0) return [];

  if (tierOf(token) !== "semantic") {
    return [
      `${label}: only semantic tokens take media overrides; component tokens follow the semantic tokens they reference`,
    ];
  }

  return overrides.flatMap(({ query, value }) => {
    const themes = perTheme(value);

    if (themes && !isThemedColor(token)) {
      return [
        `${label}: the ${query} override has per-Theme values, but only themed colors are themed`,
      ];
    }

    const references = themes ? [themes.light, themes.dark] : [value];

    return [
      ...new Set(
        references.flatMap((reference) => {
          const prefix = `${label}: the ${query} override must reference a primitive or semantic token`;

          const target = referencedToken(reference, dictionary);

          if (target === undefined) return [`${prefix}, not hold a literal`];

          const targetTier = tierOf(target);

          return targetTier === "primitive" || targetTier === "semantic"
            ? []
            : [`${prefix}, not a ${String(targetTier)} token`];
        }),
      ),
    ];
  });
};

export const checkTokens = (dictionary: Dictionary): string[] => {
  const problems = dictionary.allTokens.flatMap((token) => [
    ...checkTier(token, dictionary),
    ...checkNaming(token),
    ...checkThemes(token),
    ...checkMedia(token, dictionary),
    ...checkAnimated(token, dictionary),
  ]);

  // Contrast is only meaningful once every color resolves as designed.
  return problems.length > 0 ? problems : checkContrast(dictionary);
};
