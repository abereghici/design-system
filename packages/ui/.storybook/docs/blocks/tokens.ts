import tokensCss from "@abereghici/tokens/tokens.css?raw";

export type Tier = "semantic" | "component" | "primitive";

export type Scheme = "light" | "dark";

export interface Token {
  /** The custom property without its dashes, as in `ab-color-text-default`. */
  readonly name: string;
  readonly tier: Tier;
  /** The family for semantic and primitive tokens, the component for component tokens. */
  readonly group: string;
  /** The value as declared in the shipped CSS. */
  readonly value: string;
  /** Values that replace it under a media query or a selector. */
  readonly conditions: readonly { readonly when: string; readonly value: string }[];
  readonly description: string;
}

type Source = Record<string, Record<string, { readonly $description?: string }>>;

const componentSheets = import.meta.glob<string>("../../../../tokens/dist/components/*.css", {
  query: "?raw",
  import: "default",
  eager: true,
});

const sources = import.meta.glob<Source>("../../../../tokens/src/tokens/**/*.tokens.json", {
  import: "default",
  eager: true,
});

const descriptions = new Map(
  Object.values(sources).flatMap((source) =>
    Object.values(source).flatMap((tokens) =>
      Object.entries(tokens).map(([key, token]) => [`ab-${key}`, token.$description ?? ""]),
    ),
  ),
);

const primitives = new Set(
  Object.values(sources).flatMap((source) =>
    Object.keys(source["primitive"] ?? {}).map((key) => `ab-${key}`),
  ),
);

// Name prefixes, after `ab-`, to the family the explorer files them under; the first match wins.
const families: readonly (readonly [string, string])[] = [
  ["palette-", "Color"],
  ["color-", "Color"],
  ["type-", "Typography"],
  ["font-", "Typography"],
  ["line-height-", "Typography"],
  ["letter-spacing-", "Typography"],
  ["text-", "Typography"],
  ["underline-", "Typography"],
  ["space-", "Space"],
  ["size-", "Size"],
  ["dimension-", "Dimension"],
  ["radius-", "Shape"],
  ["border-", "Shape"],
  ["line-", "Shape"],
  ["stroke-", "Shape"],
  ["focus-", "Shape"],
  ["elevation-", "Elevation"],
  ["material-", "Elevation"],
  ["blur-", "Elevation"],
  ["saturate-", "Elevation"],
  ["opacity-", "Opacity"],
  ["motion-", "Motion"],
  ["duration-", "Motion"],
  ["easing-", "Motion"],
  ["scale-", "Motion"],
  ["layout-", "Layout"],
  ["breakpoint-", "Layout"],
  ["z-index-", "Layout"],
];

const familyOf = (name: string) =>
  families.find(([prefix]) => name.startsWith(`ab-${prefix}`))?.[1] ?? "Other";

/** Every `--ab-*` declaration in a stylesheet, read by the browser's own CSS parser. */
function declarations(css: string) {
  const sheet = new CSSStyleSheet();
  const found: { name: string; value: string; when: string | undefined }[] = [];

  sheet.replaceSync(css);

  const walk = (rules: CSSRuleList, media?: string) => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule) {
        const when = media ?? (rule.selectorText === ":root" ? undefined : rule.selectorText);

        for (const property of rule.style) {
          if (property.startsWith("--ab-")) {
            found.push({
              name: property.slice(2),
              value: rule.style.getPropertyValue(property).trim(),
              when,
            });
          }
        }
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules, rule instanceof CSSMediaRule ? rule.conditionText : media);
      }
    }
  };

  walk(sheet.cssRules);

  return found;
}

function collect(css: string, tierOf: (name: string) => Tier, groupOf: (name: string) => string) {
  const tokens = new Map<string, Token & { conditions: Token["conditions"][number][] }>();

  for (const { name, value, when } of declarations(css)) {
    const token = tokens.get(name);

    if (when === undefined) {
      tokens.set(name, {
        name,
        tier: tierOf(name),
        group: groupOf(name),
        value,
        conditions: [],
        description: primitives.has(name) ? "" : (descriptions.get(name) ?? ""),
      });
    } else token?.conditions.push({ when, value });
  }

  return [...tokens.values()];
}

/** Every token the packages ship, in source order: semantic and primitive, then each component. */
export const tokens: readonly Token[] = [
  ...collect(tokensCss, (name) => (primitives.has(name) ? "primitive" : "semantic"), familyOf),
  ...Object.entries(componentSheets).flatMap(([path, css]) => {
    const component = path.split("/").at(-1)?.replace(".css", "") ?? "";

    return collect(
      css,
      () => "component",
      () => component,
    );
  }),
];

const byName = new Map(tokens.map((token) => [token.name, token]));

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

/** The literal a token computes to in a scheme, with every reference substituted. */
export function resolve(value: string, scheme: Scheme): string {
  return pick(value, scheme).replaceAll(reference, (_, name: string) =>
    resolve(byName.get(name)?.value ?? "", scheme),
  );
}

export const isThemed = (token: Token) =>
  resolve(token.value, "light") !== resolve(token.value, "dark");

/** The tokens it points at, one alias at a time, down to the one that holds a literal. */
export function chain(token: Token, scheme: Scheme): Token[] {
  const next = /^var\(--(ab-[\w\-]+)\)$/v.exec(pick(token.value, scheme))?.[1];
  const target = next === undefined ? undefined : byName.get(next);

  return target === undefined ? [] : [target, ...chain(target, scheme)];
}

const dependents = Map.groupBy(
  tokens.flatMap((token) =>
    [token.value, ...token.conditions.map(({ value }) => value)]
      .flatMap((value) => [...value.matchAll(reference)].map(([, name]) => name))
      .map((name) => ({ name, token })),
  ),
  ({ name }) => name,
);

/** The tokens whose value, in any condition, points at this one. */
export const usedBy = (token: Token) => [
  ...new Set((dependents.get(token.name) ?? []).map(({ token: dependent }) => dependent)),
];

export const findToken = (name: string) => byName.get(name);
