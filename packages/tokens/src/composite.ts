import type { Dictionary } from "style-dictionary/types";

import { isWholeReference } from "./theme.ts";

/*
 * Composite tokens: DTCG `typography` (a type style) and `shadow` (an Elevation). Their values
 * are objects (or, for shadows, lists) whose members are references, and the CSS keeps them as
 * `var()` references, exactly like the source's hand-written shorthands:
 *   --ab-type-body-md: var(--ab-font-weight-400) var(--ab-font-size-17)/var(--ab-line-height-160) var(--ab-font-family-figtree);
 *   --ab-elevation-raised: var(--ab-elevation-ring), var(--ab-elevation-highlight), var(--ab-dimension-0) … var(--ab-color-shadow-ambient);
 */

/**
 * The two semantic-to-semantic references the source allows (its documented exceptions to R2):
 * a type style may use its own `type-*-font-size`, and an Elevation may compose
 * `elevation-ring|highlight` and the `color-shadow-*` colors.
 */
const SEMANTIC_MEMBERS: Readonly<Record<string, RegExp>> = {
  typography: /^type-[a-z]+-[a-z0-9]+-font-size$/v,
  shadow: /^(?:elevation-(?:ring|highlight)|color-shadow-[a-z]+)$/v,
};

/** Whether a composite of this `$type` may reference this semantic token (by name). */
export const allowsSemanticMember = (type: unknown, name: string): boolean =>
  SEMANTIC_MEMBERS[String(type)]?.test(name) === true;

/** Every leaf of an authored composite value, in order (`inset: true` included). */
export const leavesOf = (value: unknown): unknown[] =>
  typeof value === "object" && value !== null
    ? Object.values(value).flatMap((child) => leavesOf(child))
    : [value];

export const isComposite = (value: unknown): boolean => typeof value === "object" && value !== null;

type Ref = (reference: unknown) => string;

const shadowLayer = (layer: unknown, ref: Ref): string => {
  if (typeof layer !== "object" || layer === null) return ref(layer);
  const get = (key: string): unknown => Reflect.get(layer, key);
  const lengths = ["offsetX", "offsetY", "blur", "spread"].map((key) => ref(get(key)));
  return [...(get("inset") === true ? ["inset"] : []), ...lengths, ref(get("color"))].join(" ");
};

/** The CSS for an authored composite: a `font` shorthand or a `box-shadow` list of `var()`s. */
export const compositeCss = (type: unknown, authored: object, dictionary: Dictionary): string => {
  const ref: Ref = (reference) => {
    const target = isWholeReference(reference) ? dictionary.tokenMap.get(reference) : undefined;
    if (target === undefined) throw new Error(`unresolvable composite member ${String(reference)}`);
    return `var(--${target.name})`;
  };
  if (type === "typography") {
    const get = (key: string) => ref(Reflect.get(authored, key));
    // `letterSpacing` has no place in the `font` shorthand; it stays its own token, as in the source.
    return `${get("fontWeight")} ${get("fontSize")}/${get("lineHeight")} ${get("fontFamily")}`;
  }
  const layers: unknown[] = Array.isArray(authored) ? authored : [authored];
  return layers.map((layer) => shadowLayer(layer, ref)).join(", ");
};
