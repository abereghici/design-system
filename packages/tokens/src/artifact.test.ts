import { expect, test } from "vitest";

import type { Themed } from "./artifact-format.ts";
import { buildTokens, SOURCE_GLOB } from "./build.ts";
import { validTokens } from "./test-fixtures.ts";

const artifactOf = async () => (await buildTokens({ tokens: validTokens() })).artifact;

const namesIn = (family: { readonly tokens: readonly { readonly name: string }[] }) =>
  family.tokens.map(({ name }) => name);

test("lists the light Theme first", async () => {
  const artifact = await artifactOf();
  expect(artifact.color.themes).toEqual([
    { id: "light", name: "Light" },
    { id: "dark", name: "Dark" },
  ]);
});

test("themed colors carry a literal per Theme, light first, with $description as usage", async () => {
  const artifact = await artifactOf();
  expect(JSON.stringify(artifact)).toContain(
    '{"name":"ab-color-surface-default","value":{"light":"#ffffff","dark":"#12150f"},"usage":"The page.',
  );
});

test("fixed and translucent colors are a single literal", async () => {
  const artifact = await artifactOf();
  expect(artifact.color.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-color-brand-moss", value: "#263316" }),
  );
  expect(artifact.color.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-color-backdrop", value: "rgba(18, 21, 15, 0.64)" }),
  );
});

test("lists tiers 1 and 2 only, as the source did; component tokens stay in the CSS", async () => {
  const { name: _name, version: _version, type: _type, ...families } = await artifactOf();
  const names = Object.values(families).flatMap((family) => namesIn(family));
  expect(names).toContain("ab-palette-moss-900");
  expect(names).toContain("ab-space-inset-md");
  expect(names.filter((name) => /^ab-(?:button|card|icon|logo|input)-/v.test(name))).toEqual([]);
});

test("spacing holds the dimension scale and the space tokens; radius the radii", async () => {
  const artifact = await artifactOf();
  expect(artifact.spacing.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-space-inset-md", value: "12px" }),
  );
  expect(artifact.spacing.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-dimension-16", value: "16px" }),
  );
  expect(namesIn(artifact.radius)).toEqual(
    expect.arrayContaining(["ab-dimension-9999", "ab-radius-sm", "ab-radius-full"]),
  );
  expect(namesIn(artifact.spacing)).not.toContain("ab-dimension-9999");
  expect(namesIn(artifact.spacing)).not.toContain("ab-font-size-17");
});

test("the other families take the source's keys and plain values", async () => {
  const artifact = await artifactOf();
  expect(artifact.strokeWidth.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-stroke-width-175", value: "1.75" }),
  );
  expect(artifact.zIndex.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-z-index-100", value: "100" }),
  );
  expect(namesIn(artifact.blur)).toEqual(
    expect.arrayContaining(["ab-blur-12", "ab-material-blur-thin"]),
  );
  expect(artifact.size.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-size-icon-md", value: "20px" }),
  );
});

test("type styles show the 1280px end of a fluid size, grouped by category", async () => {
  const artifact = await artifactOf();
  const heading = artifact.type.groups.find(({ name }) => name === "Heading");
  expect(heading?.family).toBe("noto-serif");
  expect(heading?.styles[0]).toEqual(
    expect.objectContaining({
      name: "ab-type-heading-lg",
      fontSize: "2.0625rem",
      lineHeight: "1.2",
      fontWeight: 500,
      letterSpacing: "-0.02em",
    }),
  );
  expect(artifact.type.groups.map(({ name }) => name)).toEqual([
    "Heading",
    "Display",
    "Body",
    "Label",
    "Kbd",
    "Data",
    "Code",
    "Overline",
  ]);
});

test("type families and fonts come from the font tokens and the shipped files", async () => {
  const artifact = await artifactOf();
  expect(Object.keys(artifact.type.families)).toEqual(["noto-serif", "figtree", "system-mono"]);
  expect(artifact.type.families["noto-serif"]).toBe("'Noto Serif', Georgia, serif");
  expect(artifact.type.families["system-mono"]).toMatch(/monospace$/v);
  expect(artifact.type.fonts).toContainEqual({
    family: "Noto Serif",
    file: "fonts/NotoSerif-latin.woff2",
    weight: "100 900",
    style: "normal",
  });
  expect(artifact.type.fonts).toHaveLength(4);
});

const literals = (value: Themed | undefined): string[] =>
  value === undefined ? [] : typeof value === "string" ? [value] : [value.light, value.dark];

test("Elevations are box-shadow literals per Theme", async () => {
  const artifact = await artifactOf();
  const raised = artifact.shadow.tokens.find(({ name }) => name === "ab-elevation-raised");
  const [light, dark] = literals(raised?.value);
  expect(light).toMatch(/^0px 0px 0px 1px rgba\(17, 25, 6, 0\.1\), inset 0px 1px/v);
  expect(dark).toContain("inset 0px 1px 0px 0px");
  expect([light, dark].join()).not.toMatch(/var\(|\{/v);
});

test("every family keeps within the artifact's caps", async () => {
  const { artifact } = await buildTokens({ source: [SOURCE_GLOB] });
  const { name: _name, version: _version, color, type, ...others } = artifact;
  expect(color.tokens.length).toBeLessThanOrEqual(600);
  expect(type.groups.length).toBeLessThanOrEqual(12);
  expect(type.groups.flatMap(({ styles }) => styles).length).toBeLessThanOrEqual(80);
  expect(Object.keys(others).length).toBeLessThanOrEqual(12);
  expect(Object.values(others).filter((family) => family.tokens.length > 60)).toEqual([]);
  const shadows = artifact.shadow.tokens.flatMap(({ value }) => literals(value));
  expect(shadows.length).toBeGreaterThan(6);
  expect(shadows.filter((text) => text.length > 400)).toEqual([]);
});

test("names are unique across every family but type", async () => {
  const { artifact } = await buildTokens({ source: [SOURCE_GLOB] });
  const { type: _type, name: _name, version: _version, ...families } = artifact;
  const names = Object.values(families).flatMap((family) => namesIn(family));
  expect(names.length).toBe(new Set(names).size);
});

test("never carries var(), light-dark(), color-mix() or named colors", async () => {
  const { artifact } = await buildTokens({ source: [SOURCE_GLOB] });
  const { name: _name, version: _version, type, ...families } = artifact;
  const values = [
    ...Object.values(families).flatMap(({ tokens }) =>
      tokens.flatMap(({ value }) => literals(value)),
    ),
    ...type.groups.flatMap(({ styles }) =>
      styles.flatMap(({ fontSize, lineHeight, letterSpacing }) => [
        fontSize,
        lineHeight,
        letterSpacing,
      ]),
    ),
    ...Object.values(type.families),
  ];
  expect(values.length).toBeGreaterThan(400);
  const banned = /var\(|light-dark\(|color-mix\(|transparent|currentColor|clamp\(|\{/v;
  expect(values.filter((value) => banned.test(value))).toEqual([]);
});
