import { globSync, readFileSync } from "node:fs";

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

const groupOf = (path: string, tier: string): Record<string, object> => {
  const file: unknown = JSON.parse(readFileSync(path, "utf8"));
  const group: unknown = isGroup(file) ? Reflect.get(file, tier) : undefined;

  if (!isGroup(group)) throw new Error(`${path} has no "${tier}" group`);

  return group;
};

const source = `${import.meta.dirname}/tokens`;

export const validTokens = () => ({
  primitive: groupOf(`${source}/primitive.tokens.json`, "primitive"),
  semantic: groupOf(`${source}/semantic.tokens.json`, "semantic"),
  component: Object.fromEntries(
    globSync(`${source}/component/*.tokens.json`).flatMap((path) =>
      Object.entries(groupOf(path, "component")),
    ),
  ),
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
