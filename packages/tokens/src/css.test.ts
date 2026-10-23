import { expect, test } from "vitest";

import { buildTokens, SOURCE_GLOB } from "./build.ts";
import { validTokens } from "./test-fixtures.ts";

test("primitive tokens are literal --ab- custom properties", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  expect(css).toContain("--ab-palette-moss-900: #263316;");
  expect(css).toContain("--ab-dimension-8: 8px;");
});

test("semantic and component tokens reference the tier below with var()", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  expect(css).toContain("--ab-radius-sm: var(--ab-dimension-8);");
  expect(css).toContain("--ab-color-brand-moss: var(--ab-palette-moss-900);");
  expect(css).toContain("--ab-button-border-radius: var(--ab-radius-sm);");
  expect(css).toContain("--ab-card-background-color: var(--ab-color-surface-default);");
});

test("themed colors resolve per Theme with light-dark(), light first", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  expect(css).toContain(
    "--ab-color-surface-default: light-dark(var(--ab-palette-sage-0), var(--ab-palette-night-950));",
  );
});

test("no data-theme follows the system; data-theme forces a Theme on a subtree", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  expect(css).toMatch(/:root \{\s+color-scheme: light dark;/v);
  expect(css).toMatch(/\[data-theme="light"\] \{\s+color-scheme: light;\s+\}/v);
  expect(css).toMatch(/\[data-theme="dark"\] \{\s+color-scheme: dark;\s+\}/v);
});

test("everything sits in the ab.tokens cascade layer", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  expect(css).toMatch(/^\/\*[^\n]*\*\/\n@layer ab\.tokens \{\n[\s\S]*\n\}\n$/v);
});

test("properties are listed primitive, then semantic, then component", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  const order = [
    "--ab-palette-sage-0:",
    "--ab-color-surface-default:",
    "--ab-card-background-color:",
  ];
  const positions = order.map((name) => css.indexOf(name));
  expect(positions).toEqual(positions.toSorted((a, b) => a - b));
  expect(positions).not.toContain(-1);
});

test("the package's own token source passes every check and compiles", async () => {
  const { css } = await buildTokens({ source: [SOURCE_GLOB] });
  expect(css).toContain(
    "--ab-button-primary-background-color: var(--ab-color-background-accent-bold);",
  );
  expect(css).toContain(
    "--ab-color-background-accent-bold: light-dark(var(--ab-palette-moss-900), var(--ab-palette-lichen-200));",
  );
});
