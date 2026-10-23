import { expect, test } from "vitest";

import { buildTokens, SOURCE_GLOB } from "./build.ts";
import { validTokens } from "./test-fixtures.ts";

test("lists the light Theme first", async () => {
  const { artifact } = await buildTokens({ tokens: validTokens() });
  expect(artifact.color.themes).toEqual([
    { id: "light", name: "Light" },
    { id: "dark", name: "Dark" },
  ]);
});

test("themed colors carry a literal per Theme, light first, with $description as usage", async () => {
  const { artifact } = await buildTokens({ tokens: validTokens() });
  // Source: color.css, :root sage-0 #ffffff and [data-theme="dark"] night-950 #12150f.
  expect(JSON.stringify(artifact)).toContain(
    '{"name":"ab-color-surface-default","value":{"light":"#ffffff","dark":"#12150f"},"usage":"The page.',
  );
});

test("component colors resolve through the semantic token to each Theme", async () => {
  const { artifact } = await buildTokens({ tokens: validTokens() });
  expect(artifact.color.tokens).toContainEqual({
    name: "ab-card-background-color",
    value: { light: "#ffffff", dark: "#12150f" },
    usage: "",
  });
});

test("fixed and translucent colors are a single literal", async () => {
  const { artifact } = await buildTokens({ tokens: validTokens() });
  expect(artifact.color.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-color-brand-moss", value: "#263316" }),
  );
  // Source: palette.css, --ab-palette-night-950-a64: rgb(18 21 15 / .64).
  expect(artifact.color.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-color-backdrop", value: "rgba(18, 21, 15, 0.64)" }),
  );
});

test("lengths are flat lists of literals, radius apart from spacing", async () => {
  const { artifact } = await buildTokens({ tokens: validTokens() });
  expect(artifact.spacing.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-space-inset-md", value: "12px" }),
  );
  expect(artifact.radius.tokens).toContainEqual(
    expect.objectContaining({ name: "ab-button-border-radius", value: "8px" }),
  );
  expect(artifact.spacing.tokens.map(({ name }) => name)).not.toContain("ab-radius-sm");
});

test("type, motion and material lengths are left out of the spacing list", async () => {
  const { artifact } = await buildTokens({ tokens: validTokens() });
  const names = artifact.spacing.tokens.map(({ name }) => name);
  expect(names).not.toContain("ab-font-size-17");
  expect(names).not.toContain("ab-letter-spacing-0");
  expect(names).not.toContain("ab-blur-12");
});

test("never carries var(), light-dark(), color-mix() or named colors", async () => {
  const { artifact } = await buildTokens({ source: [SOURCE_GLOB] });
  const entries = [...artifact.color.tokens, ...artifact.spacing.tokens, ...artifact.radius.tokens];
  const values = JSON.stringify(entries.map(({ value }) => value));
  expect(values).not.toMatch(/var\(|light-dark\(|color-mix\(|transparent|currentColor/v);
  // Every value is a literal the artifact page reads (hex, rgba() or a length): once those
  // and the JSON structure are removed, nothing is left.
  const rest = values
    .replaceAll(/"(?:#[0-9a-f]{6}|rgba\([\d., ]+\)|[\d.]+(?:px|rem))"/gv, "")
    .replaceAll(/"(?:light|dark)":|[\[\]\{\},]/gv, "");
  expect(rest).toBe("");
});
