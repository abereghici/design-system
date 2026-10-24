import type { Dictionary, TransformedToken } from "style-dictionary/types";

import { FONT_FAMILIES, FONT_SUBSETS, fontFileName } from "./fonts.ts";
import { THEMES, isWholeReference, valueIn, type ThemeId } from "./theme.ts";
import { inTierOrder, tierOf } from "./tiers.ts";

export interface ArtifactEntry<Value> {
  readonly name: string;
  readonly value: Value;
  readonly usage: string;
}

export type Themed = string | { readonly light: string; readonly dark: string };

export interface ArtifactFamily<Value = string> {
  readonly note?: string;
  readonly tokens: readonly ArtifactEntry<Value>[];
}

export interface ArtifactTypeStyle {
  readonly name: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
  readonly usage: string;
}

export interface ArtifactType {
  readonly fonts: readonly {
    readonly family: string;
    readonly file: string;
    readonly weight: string;
    readonly style: "normal";
  }[];
  readonly families: Readonly<Record<string, string>>;
  readonly groups: readonly {
    readonly name: string;
    readonly family: string;
    readonly styles: readonly ArtifactTypeStyle[];
  }[];
}

const LISTS = [
  "spacing",
  "radius",
  "shadow",
  "size",
  "strokeWidth",
  "line",
  "opacity",
  "blur",
  "saturate",
  "scale",
  "zIndex",
  "layout",
] as const;

type List = (typeof LISTS)[number];

export type ArtifactTokens = {
  readonly name: string;
  readonly version: 1;
  readonly color: ArtifactFamily<Themed> & { readonly themes: typeof THEMES };
  readonly type: ArtifactType;
  readonly shadow: ArtifactFamily<Themed>;
} & { readonly [Key in Exclude<List, "shadow">]: ArtifactFamily };

const NOTES: Partial<Record<List, string>> = {
  line: "Border widths, focus rings and underlines.",
  layout: "Column and label widths, the gutter and the breakpoint.",
  shadow: "The Elevations: a hairline ring, an inner highlight (dark only) and soft shadows.",
};

type Placement = { readonly list: List } | { readonly in: "color" | "type" } | undefined;

const BY_NAME: readonly (readonly [RegExp, List])[] = [
  [/^ab-(?:dimension-9999|radius-)/v, "radius"],
  [/^ab-(?:dimension|space)-/v, "spacing"],
  [/^ab-size-/v, "size"],
  [/^ab-stroke-width-/v, "strokeWidth"],
  [/^ab-(?:border-width|focus-ring|underline)-/v, "line"],
  [/^ab-opacity-/v, "opacity"],
  [/^ab-(?:material-)?blur-/v, "blur"],
  [/^ab-(?:material-)?saturate-/v, "saturate"],
  [/^ab-scale-/v, "scale"],
  [/^ab-z-index-/v, "zIndex"],
  [/^ab-(?:layout|breakpoint)-/v, "layout"],
];

const UNLISTED =
  /^ab-(?:type-|font-|line-height-|letter-spacing-|text-transform-|duration-|easing-|motion-)/v;

// An unmapped tier-1 or tier-2 token throws, so a new kind of token is placed here on purpose.
const placementOf = (token: TransformedToken): Placement => {
  if (tierOf(token) === "component") return undefined;
  if (token.$type === "color") return { in: "color" };
  if (token.$type === "shadow") return { list: "shadow" };
  if (token.$type === "typography") return { in: "type" };
  const named = BY_NAME.find(([pattern]) => pattern.test(token.name));
  if (named !== undefined) return { list: named[1] };
  if (UNLISTED.test(token.name)) return undefined;
  throw new Error(`--${token.name}: no artifact family (see src/artifact-format.ts)`);
};

const entry = <Value>(token: TransformedToken, value: Value): ArtifactEntry<Value> => ({
  name: token.name,
  value,
  usage: token.$description ?? "",
});

const themed = (light: string, dark: string): Themed => (light === dark ? light : { light, dark });

const colorValue = (token: TransformedToken, dictionary: Dictionary): Themed =>
  themed(String(valueIn(token, "light", dictionary)), String(valueIn(token, "dark", dictionary)));

const memberOf = (value: unknown, key: string): unknown =>
  typeof value === "object" && value !== null ? Reflect.get(value, key) : undefined;

const layerCss = (layer: unknown, theme: ThemeId, dictionary: Dictionary): string => {
  const member = (key: string) => {
    const value = memberOf(layer, key);
    const target = isWholeReference(value) ? dictionary.tokenMap.get(value) : undefined;
    return String(target === undefined ? value : valueIn(target, theme, dictionary));
  };
  const inset = memberOf(layer, "inset") === true ? "inset " : "";
  const lengths = ["offsetX", "offsetY", "blur", "spread"].map((key) => member(key)).join(" ");
  return `${inset}${lengths} ${member("color")}`;
};

const shadowLayers = (
  token: TransformedToken,
  theme: ThemeId,
  dictionary: Dictionary,
): string[] => {
  const authored: unknown = token.original.$value;
  const layers: unknown[] = Array.isArray(authored) ? authored : [authored];
  const css: string[] = [];
  for (const layer of layers) {
    if (!isWholeReference(layer)) {
      css.push(layerCss(layer, theme, dictionary));
      continue;
    }
    const target = dictionary.tokenMap.get(layer);
    if (target === undefined) throw new Error(`--${token.name}: ${layer} does not exist`);
    css.push(...shadowLayers(target, theme, dictionary));
  }
  return css;
};

const shadowValue = (token: TransformedToken, dictionary: Dictionary): Themed =>
  themed(
    shadowLayers(token, "light", dictionary).join(", "),
    shadowLayers(token, "dark", dictionary).join(", "),
  );

const shownSize = (fontSize: unknown) => {
  const text = String(fontSize);
  const fluid = /^clamp\(.*,\s*(?<max>[^,\(\)]+)\)$/v.exec(text);
  return fluid?.groups?.["max"]?.trim() ?? text;
};

const capitalized = (word: string) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`;

const styleOf = (token: TransformedToken): ArtifactTypeStyle => ({
  name: token.name,
  fontSize: shownSize(memberOf(token.$value, "fontSize")),
  lineHeight: String(memberOf(token.$value, "lineHeight")),
  fontWeight: Number(memberOf(token.$value, "fontWeight")),
  letterSpacing: String(memberOf(token.$value, "letterSpacing")),
  usage: token.$description ?? "",
});

const FONTS: ArtifactType["fonts"] = FONT_FAMILIES.flatMap((family) =>
  FONT_SUBSETS.map((subset) => ({
    family: family.family,
    file: `fonts/${fontFileName(family, subset)}`,
    weight: family.weight,
    style: "normal" as const,
  })),
);

const typeOf = (tokens: readonly TransformedToken[]): ArtifactType => {
  const families: Record<string, string> = {};
  const groups = new Map<string, { family: string; styles: ArtifactTypeStyle[] }>();
  for (const token of tokens) {
    if (token.$type === "fontFamily" && tierOf(token) === "primitive") {
      families[token.name.replace("ab-font-family-", "")] = String(token.$value);
    }
  }
  for (const token of tokens) {
    if (token.$type !== "typography" || tierOf(token) !== "semantic") continue;
    const category = /^ab-type-(?<cat>[a-z]+)-/v.exec(token.name)?.groups?.["cat"] ?? "";
    const stack = memberOf(token.$value, "fontFamily");
    const family = Object.keys(families).find((key) => families[key] === stack) ?? "";
    const group = groups.get(category) ?? { family, styles: [] };
    group.styles.push(styleOf(token));
    groups.set(category, group);
  }
  return {
    fonts: FONTS,
    families,
    groups: [...groups.keys()].map((category) => ({
      name: capitalized(category),
      family: groups.get(category)?.family ?? "",
      styles: groups.get(category)?.styles ?? [],
    })),
  };
};

export const toArtifactTokens = (dictionary: Dictionary): ArtifactTokens => {
  const tokens = inTierOrder(dictionary.allTokens);
  const colors: TransformedToken[] = [];
  const lists = new Map<List, TransformedToken[]>(LISTS.map((list) => [list, []]));
  for (const token of tokens) {
    const placement = placementOf(token);
    if (placement === undefined) continue;
    if ("list" in placement) lists.get(placement.list)?.push(token);
    else if (placement.in === "color") colors.push(token);
  }
  const family = <Value>(list: List, value: (token: TransformedToken) => Value) => ({
    ...(NOTES[list] === undefined ? {} : { note: NOTES[list] }),
    tokens: (lists.get(list) ?? []).map((token) => entry(token, value(token))),
  });
  const plain = (list: List) => family(list, (token) => String(token.$value));
  return {
    name: "Bereghici Design System",
    version: 1,
    color: {
      themes: THEMES,
      tokens: colors.map((token) => entry(token, colorValue(token, dictionary))),
    },
    type: typeOf(tokens),
    spacing: plain("spacing"),
    radius: plain("radius"),
    shadow: family("shadow", (token) => shadowValue(token, dictionary)),
    size: plain("size"),
    strokeWidth: plain("strokeWidth"),
    line: plain("line"),
    opacity: plain("opacity"),
    blur: plain("blur"),
    saturate: plain("saturate"),
    scale: plain("scale"),
    zIndex: plain("zIndex"),
    layout: plain("layout"),
  };
};
