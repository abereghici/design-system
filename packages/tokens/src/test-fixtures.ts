import { readFileSync } from "node:fs";

/** A DTCG 2025.10 sRGB color with its hex fallback. */
export const srgb = (hex: string) => ({
  colorSpace: "srgb",
  components: [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255),
  hex,
});

/** A themed semantic color: `$value` is the light Theme, the extension holds the dark Theme. */
export const themed = (light: string, dark: string) => ({
  $type: "color",
  $value: `{primitive.${light}}`,
  $extensions: { "com.bereghici.theme": { dark: `{primitive.${dark}}` } },
});

const isGroup = (value: unknown): value is Record<string, object> =>
  typeof value === "object" && value !== null;

/** One tier of the package's own source, as a fresh object. */
const sourceTier = (tier: string): Record<string, object> => {
  const file: unknown = JSON.parse(
    readFileSync(new URL(`tokens/${tier}.tokens.json`, import.meta.url), "utf8"),
  );
  const group: unknown = isGroup(file) ? Reflect.get(file, tier) : undefined;
  if (!isGroup(group)) throw new Error(`src/tokens/${tier}.tokens.json has no "${tier}" group`);
  return group;
};

/**
 * The package's own token set (every source token), as a fresh object to mutate. Each test
 * breaks one rule in a set that otherwise passes every check, contrast included.
 */
export const validTokens = () => ({
  primitive: sourceTier("primitive"),
  semantic: sourceTier("semantic"),
  component: sourceTier("component"),
});

/** Replaces one member of a composite token's `$value` (e.g. a type style's `fontWeight`). */
export const setMember = (
  group: Readonly<Record<string, object>>,
  name: string,
  member: string,
  value: unknown,
): void => {
  const composite: unknown = Reflect.get(group[name] ?? {}, "$value");
  if (!isGroup(composite)) throw new Error(`${name} is not a composite token`);
  Reflect.set(composite, member, value);
};
