import { readFileSync } from "node:fs";

export const srgb = (hex: string) => ({
  colorSpace: "srgb",
  components: [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255),
  hex,
});

export const themed = (light: string, dark: string) => ({
  $type: "color",
  $value: `{primitive.${light}}`,
  $extensions: { "com.bereghici.theme": { dark: `{primitive.${dark}}` } },
});

const isGroup = (value: unknown): value is Record<string, object> =>
  typeof value === "object" && value !== null;

const sourceTier = (tier: string): Record<string, object> => {
  const file: unknown = JSON.parse(
    readFileSync(new URL(`tokens/${tier}.tokens.json`, import.meta.url), "utf8"),
  );
  const group: unknown = isGroup(file) ? Reflect.get(file, tier) : undefined;

  if (!isGroup(group)) throw new Error(`src/tokens/${tier}.tokens.json has no "${tier}" group`);

  return group;
};

export const validTokens = () => ({
  primitive: sourceTier("primitive"),
  semantic: sourceTier("semantic"),
  component: sourceTier("component"),
});

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
