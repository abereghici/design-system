import type { Dictionary } from "style-dictionary/types";

import { referencedToken } from "./theme.ts";

const SEMANTIC_MEMBERS: Readonly<Record<string, RegExp>> = {
  typography: /^type-[a-z]+-[a-z0-9]+-font-size$/v,
  shadow: /^(?:elevation-(?:ring|highlight)|color-shadow-[a-z]+)$/v,
};

export const allowsSemanticMember = (type: unknown, name: string): boolean =>
  SEMANTIC_MEMBERS[String(type)]?.test(name) === true;

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

export const compositeCss = (type: unknown, authored: object, dictionary: Dictionary): string => {
  const ref: Ref = (reference) => {
    const target = referencedToken(reference, dictionary);

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
