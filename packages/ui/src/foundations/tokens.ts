// The foundations pages are generated from the DTCG token source, so a token added, renamed or
// re-valued in packages/tokens shows up here without editing a page. Documentation only: the
// docs read primitive tokens to show where values come from, which product code never does (R4).
import component from "@platform/tokens/source/component.tokens.json";
import primitive from "@platform/tokens/source/primitive.tokens.json";
import semantic from "@platform/tokens/source/semantic.tokens.json";

export type Tier = "primitive" | "semantic" | "component";
export type ThemeId = "light" | "dark";

interface SourceToken {
  readonly $type: string;
  readonly $value: unknown;
  readonly $description?: string;
  readonly $extensions?: Readonly<Record<string, unknown>>;
}

/** A token as the docs show it. */
export interface Token {
  /** The name after `--ab-` (`color-text-subtle`). */
  readonly name: string;
  readonly tier: Tier;
  readonly type: string;
  readonly description: string;
  /** The authored value: a reference, a literal, or a composite of either. */
  readonly value: unknown;
  /** The dark Theme's authored value, for themed colors. */
  readonly dark: unknown;
  /** Media query → authored value (`com.bereghici.media`). */
  readonly media: Readonly<Record<string, unknown>>;
}

const THEME_EXTENSION = "com.bereghici.theme";
const MEDIA_EXTENSION = "com.bereghici.media";

const sources: Readonly<Record<Tier, Readonly<Record<string, SourceToken>>>> = {
  primitive: primitive.primitive,
  semantic: semantic.semantic,
  component: component.component,
};

/** A property of an object value, or undefined for anything else. */
export const field = (value: unknown, key: string): unknown =>
  typeof value === "object" && value !== null ? Reflect.get(value, key) : undefined;

const toToken = (tier: Tier, name: string, source: SourceToken): Token => {
  const media = source.$extensions?.[MEDIA_EXTENSION];
  return {
    name,
    tier,
    type: source.$type,
    description: source.$description ?? "",
    value: source.$value,
    dark: field(source.$extensions?.[THEME_EXTENSION], "dark"),
    media: typeof media === "object" && media !== null ? { ...media } : {},
  };
};

/** Every token of a tier whose name matches, in source order. */
export function tokens(tier: Tier, name: RegExp): Token[] {
  return Object.entries(sources[tier])
    .filter(([tokenName]) => name.test(tokenName))
    .map(([tokenName, source]) => toToken(tier, tokenName, source));
}

/** One token, or an error naming the token: a page must not silently drop a row. */
export function token(tier: Tier, name: string): Token {
  const source = sources[tier][name];
  if (source === undefined) throw new Error(`No ${tier} token named ${name}`);
  return toToken(tier, name, source);
}

const TIERS: ReadonlySet<string> = new Set<Tier>(["primitive", "semantic", "component"]);
const isTier = (value: string | undefined): value is Tier =>
  value !== undefined && TIERS.has(value);

const REFERENCE = /^\{(?<tier>primitive|semantic|component)\.(?<name>[^\{\}]+)\}$/v;

/** The token a whole-reference value points at, or undefined for a literal. */
export function referenced(value: unknown): Token | undefined {
  const groups = typeof value === "string" ? REFERENCE.exec(value)?.groups : undefined;
  const tier = groups?.["tier"];
  const name = groups?.["name"];
  return isTier(tier) && name !== undefined ? token(tier, name) : undefined;
}

/** A value as text: a reference becomes the token name, a DTCG literal its CSS text. */
export function describe(value: unknown): string {
  const target = referenced(value);
  if (target !== undefined) return target.name;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map((item) => describe(item)).join(", ");
  const [light, dark] = [field(value, "light"), field(value, "dark")];
  if (light !== undefined && dark !== undefined) {
    return `${describe(light)} light · ${describe(dark)} dark`;
  }
  // A DTCG shadow layer, in `box-shadow` order.
  const layer = ["offsetX", "offsetY", "blur", "spread", "color"].map((key) => field(value, key));
  if (layer.every((part) => part !== undefined)) {
    const inset = field(value, "inset") === true ? "inset " : "";
    return `${inset}${layer.map((part) => describe(part)).join(" ")}`;
  }
  const [hex, amount, unit] = [field(value, "hex"), field(value, "value"), field(value, "unit")];
  if (typeof hex === "string") return hex;
  if (typeof amount === "number" && typeof unit === "string") return `${amount}${unit}`;
  return JSON.stringify(value);
}

/** The authored value of a token in a Theme (its dark value, when it has one). */
export const valueIn = (subject: Token, theme: ThemeId): unknown =>
  theme === "dark" && subject.dark !== undefined ? subject.dark : subject.value;

/** The value a token resolves to in a Theme, following references to a primitive literal. */
export function resolve(value: unknown, theme: ThemeId): unknown {
  const target = referenced(value);
  if (target === undefined) return value;
  return resolve(valueIn(target, theme), theme);
}

/** A color token's `#rrggbb` (or `#rrggbbaa`) in a Theme. */
export function hexIn(subject: Token, theme: ThemeId): string {
  const resolved = resolve(valueIn(subject, theme), theme);
  const [hex, alpha] = [field(resolved, "hex"), field(resolved, "alpha")];
  if (typeof hex !== "string") throw new Error(`${subject.name} does not resolve to a color`);
  if (typeof alpha !== "number" || alpha === 1) return hex;
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;
}
