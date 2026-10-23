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

test("themed colors carry a literal per Theme, light first", async () => {
  const { artifact } = await buildTokens({ tokens: validTokens() });
  expect(JSON.stringify(artifact)).toContain(
    '{"name":"ab-color-surface-default","value":{"light":"#ffffff","dark":"#12150f"},"usage":""}',
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

test("fixed colors are a single literal, with $description as usage", async () => {
  const { artifact } = await buildTokens({ tokens: validTokens() });
  expect(artifact.color.tokens).toContainEqual({
    name: "ab-color-brand-moss",
    value: "#263316",
    usage: "Identity hue Moss, fixed in both themes.",
  });
});

test("lengths are flat lists of literals, radius apart from spacing", async () => {
  const { artifact } = await buildTokens({ tokens: validTokens() });
  expect(artifact.spacing.tokens).toEqual([{ name: "ab-dimension-8", value: "8px", usage: "" }]);
  expect(artifact.radius.tokens).toEqual([
    { name: "ab-radius-sm", value: "8px", usage: "" },
    { name: "ab-button-border-radius", value: "8px", usage: "" },
  ]);
});

test("never carries var(), light-dark(), color-mix() or named colors", async () => {
  const { artifact } = await buildTokens({ source: [SOURCE_GLOB] });
  expect(JSON.stringify(artifact)).not.toMatch(
    /var\(|light-dark\(|color-mix\(|transparent|currentColor/v,
  );
});
