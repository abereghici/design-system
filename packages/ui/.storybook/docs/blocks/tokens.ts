import { catalog, themes } from "@abereghici/tokens/catalog";
import type { CatalogToken } from "@abereghici/tokens/catalog";

export { themes };

export type Scheme = (typeof themes)[number]["id"];

export type Tier = CatalogToken["tier"];

/** The tiers in build order, each referencing the one before it. */
export const tiers = [
  ["primitive", "Primitive"],
  ["semantic", "Semantic"],
  ["component", "Component"],
] as const satisfies readonly (readonly [Tier, string])[];

/** A catalog token with its value resolved in each Theme. */
export interface Token extends CatalogToken {
  readonly light: string;
  readonly dark: string;
  readonly themed: boolean;
  /** Its name, description and values, lowercased, for search. */
  readonly search: string;
}

const declared = new Map(catalog.map((token) => [token.name, token]));

const reference = /var\(--(ab-[\w\-]+)\)/gv;

/** The `light-dark()` branch for the scheme, parenthesis-aware. */
function pick(value: string, scheme: Scheme): string {
  const start = value.indexOf("light-dark(");

  if (start === -1) return value;

  let depth = 0;
  let comma = -1;
  let end = value.length;

  for (let index = start + "light-dark(".length; index < value.length; index++) {
    const char = value[index];

    if (char === "(") depth++;
    else if (char === ")" && depth-- === 0) {
      end = index;
      break;
    } else if (char === "," && depth === 0) comma = index;
  }

  const branch =
    scheme === "light"
      ? value.slice(start + "light-dark(".length, comma)
      : value.slice(comma + 1, end);

  return pick(`${value.slice(0, start)}${branch.trim()}${value.slice(end + 1)}`, scheme);
}

/** The literal a CSS value computes to in a scheme, with every token reference substituted. */
export function resolve(value: string, scheme: Scheme): string {
  return pick(value, scheme).replaceAll(reference, (_, name: string) =>
    resolve(declared.get(name)?.value ?? "", scheme),
  );
}

/** Every token the packages ship, in tier order, from the tokens build's catalog. */
export const tokens: readonly Token[] = [...declared.values()].map((token) => {
  const light = resolve(token.value, "light");
  const dark = resolve(token.value, "dark");

  return {
    ...token,
    light,
    dark,
    themed: light !== dark,
    search: [token.name, token.description, light, dark].join(" ").toLowerCase(),
  };
});

const byName = new Map(tokens.map((token) => [token.name, token]));

export const findToken = (name: string) => byName.get(name);

export const semantic = (pattern: RegExp) =>
  tokens.filter(({ tier, name }) => tier === "semantic" && pattern.test(name));

/** A resolved value as people read it: px for rem, ms for seconds, "fluid" for a clamp. */
export function shown(value: string) {
  if (value.startsWith("clamp(")) return "fluid";

  if (/^[\d.]+s$/v.test(value)) return `${Math.round(Number(value.replace("s", "")) * 1000)}ms`;

  return value.endsWith("rem") ? `${Number(value.replace("rem", "")) * 16}px` : value;
}

/** The tokens it points at, one alias at a time, down to the one that holds a literal. */
export function chain(token: Token, scheme: Scheme): Token[] {
  const next = /^var\(--(ab-[\w\-]+)\)$/v.exec(pick(token.value, scheme))?.[1];
  const target = next === undefined ? undefined : byName.get(next);

  return target === undefined ? [] : [target, ...chain(target, scheme)];
}

/** The tokens whose value, in any condition, points at this one. */
export const usedBy = (token: Token) =>
  tokens.filter((dependent) =>
    [dependent.value, ...dependent.conditions.map(({ value }) => value)].some((value) =>
      value.includes(`var(--${token.name})`),
    ),
  );
