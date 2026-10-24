import { expect, test } from "vitest";

import { buildTokens, SOURCE_GLOB } from "./build.ts";
import { validTokens } from "./test-fixtures.ts";

test("primitive tokens are literal --ab- custom properties", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  expect(css).toContain("--ab-palette-moss-900: #263316;");
  expect(css).toContain("--ab-dimension-8: 8px;");
});

test("semantic and component tokens reference the tier below with var()", async () => {
  const { css, components } = await buildTokens({ tokens: validTokens() });
  expect(css).toContain("--ab-radius-sm: var(--ab-dimension-8);");
  expect(css).toContain("--ab-color-brand-moss: var(--ab-palette-moss-900);");
  expect(components["button"]).toContain("--ab-button-border-radius: var(--ab-radius-sm);");
  expect(components["card"]).toContain(
    "--ab-card-background-color: var(--ab-color-surface-default);",
  );
});

test("each component's tokens get their own sheet, and the shared sheet has none", async () => {
  const { css, components } = await buildTokens({ tokens: validTokens() });
  expect(css).not.toMatch(/--ab-(?:button|card|icon-button|logo)-/v);
  expect(components["button"]).toMatch(
    /^\/\*[^\n]*\*\/\n@layer ab\.tokens \{\n {2}:root \{\n(?: {4}--ab-button-[^\n]+\n)+ {2}\}\n\}\n$/v,
  );
  expect(components["icon-button"]).not.toMatch(/--ab-button-/v);
  expect(components["icon"]).not.toMatch(/--ab-icon-button-/v);
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

test("properties are listed primitive, then semantic", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  const order = ["--ab-palette-sage-0:", "--ab-color-surface-default:"];
  const positions = order.map((name) => css.indexOf(name));
  expect(positions).toEqual(positions.toSorted((a, b) => a - b));
  expect(positions).not.toContain(-1);
});

test("durations, easings, font stacks and CSS-only values compile to CSS literals", async () => {
  const tokens = validTokens();
  Object.assign(tokens.primitive, {
    "duration-70": { $type: "duration", $value: { value: 70, unit: "ms" } },
    "easing-ease-out-strong": { $type: "cubicBezier", $value: [0.23, 1, 0.32, 1] },
    "easing-spring-gentle": { $type: "string", $value: "linear(0, 0.5 50%, 1)" },
    "font-family-noto-serif": { $type: "fontFamily", $value: ["Noto Serif", "Georgia", "serif"] },
    "font-size-17": { $type: "dimension", $value: { value: 1.0625, unit: "rem" } },
    "font-size-29-33": {
      $type: "dimension",
      $value: "clamp(1.8125rem, 1.7147rem + 0.4348vi, 2.0625rem)",
    },
    "letter-spacing-minus-20": { $type: "dimension", $value: "-0.02em" },
    "scale-97": { $type: "number", $value: 0.97 },
  });
  const { css } = await buildTokens({ tokens });
  expect(css).toContain("--ab-duration-70: 70ms;");
  expect(css).toContain("--ab-easing-ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);");
  expect(css).toContain("--ab-easing-spring-gentle: linear(0, 0.5 50%, 1);");
  expect(css).toContain("--ab-font-family-noto-serif: 'Noto Serif', Georgia, serif;");
  expect(css).toContain("--ab-font-size-17: 1.0625rem;");
  expect(css).toContain("--ab-font-size-29-33: clamp(1.8125rem, 1.7147rem + 0.4348vi, 2.0625rem);");
  expect(css).toContain("--ab-letter-spacing-minus-20: -0.02em;");
  expect(css).toContain("--ab-scale-97: 0.97;");
});

test("a type style is a font shorthand of var() references, like the source", async () => {
  const tokens = validTokens();
  tokens.component["button-font"] = { $type: "typography", $value: "{semantic.type-label-sm}" };
  const { css, components } = await buildTokens({ tokens });
  expect(css).toContain(
    "--ab-type-label-sm: var(--ab-font-weight-500) var(--ab-type-label-sm-font-size)/var(--ab-line-height-120) var(--ab-font-family-figtree);",
  );
  expect(components["button"]).toContain("--ab-button-font: var(--ab-type-label-sm);");
});

test("an Elevation is a box-shadow list of var() references, like the source", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  expect(css).toContain(
    "--ab-elevation-ring: var(--ab-dimension-0) var(--ab-dimension-0) var(--ab-dimension-0) var(--ab-dimension-1) var(--ab-color-shadow-ring);",
  );
  expect(css).toContain(
    "--ab-elevation-highlight: inset var(--ab-dimension-0) var(--ab-dimension-1) var(--ab-dimension-0) var(--ab-dimension-0) var(--ab-color-shadow-highlight);",
  );
  expect(css).toContain(
    "--ab-elevation-raised: var(--ab-elevation-ring), var(--ab-elevation-highlight), var(--ab-dimension-0) var(--ab-dimension-1) var(--ab-dimension-2) var(--ab-dimension-0) var(--ab-color-shadow-ambient);",
  );
});

test("media overrides are emitted as @media blocks on :root, inside the layer", async () => {
  const tokens = validTokens();
  tokens.semantic["radius-sm"] = {
    $type: "dimension",
    $value: "{primitive.dimension-8}",
    $extensions: { "com.bereghici.media": { "(min-resolution: 2x)": "{primitive.dimension-10}" } },
  };
  const { css } = await buildTokens({ tokens });
  expect(css).toContain(
    [
      "  @media (min-resolution: 2x) {",
      "    :root {",
      "      --ab-radius-sm: var(--ab-dimension-10);",
      "    }",
      "  }",
    ].join("\n"),
  );
  expect(css).toMatch(
    /@media \(prefers-contrast: more\) \{\n {4}:root \{\n(?: {6}.+\n)* {6}--ab-color-border-subtle: var\(--ab-color-border-default\);\n/v,
  );
  expect(css).toContain(
    "      --ab-color-material-thick: light-dark(var(--ab-palette-sage-0), var(--ab-palette-night-900));",
  );
  expect(css).toMatch(/\}\n\}\n$/v);
});

test("an animated token is registered with @property and inherits: false, in its component's sheet", async () => {
  const tokens = validTokens();
  tokens.primitive["scale-97"] = { $type: "number", $value: 0.97 };
  tokens.semantic["motion-scale-pressed"] = { $type: "number", $value: "{primitive.scale-97}" };
  tokens.component["button-scale-pressed"] = {
    $type: "number",
    $value: "{semantic.motion-scale-pressed}",
    $extensions: { "com.bereghici.animated": true },
  };
  tokens.component["button-md-padding-inline"] = {
    $type: "dimension",
    $value: "{semantic.radius-sm}",
    $extensions: { "com.bereghici.animated": true },
  };
  const { css, components } = await buildTokens({ tokens });
  expect(css).not.toContain("@property");
  expect(components["button"]).toContain(
    [
      "@property --ab-button-md-padding-inline {",
      '  syntax: "<length>";',
      "  inherits: false;",
      "  initial-value: 8px;",
      "}",
      "",
      "@property --ab-button-scale-pressed {",
      '  syntax: "<number>";',
      "  inherits: false;",
      "  initial-value: 0.97;",
      "}",
      "",
      "@layer ab.tokens {",
    ].join("\n"),
  );
  expect(components["button"]?.match(/@property/gv)).toHaveLength(2);
});

test("a themed color with the same value in both Themes needs no light-dark()", async () => {
  const { css } = await buildTokens({ tokens: validTokens() });
  expect(css).toContain("--ab-color-backdrop: var(--ab-palette-night-950-a64);");
});

test("ports every source token (210 primitive, 294 semantic, 413 component) plus 79 phase-1, 50 phase-2, 61 phase-3, 24 phase-4 and 30 phase-5 component tokens", async () => {
  const { css, components } = await buildTokens({ source: [SOURCE_GLOB] });
  const root = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
  expect(root.match(/^ {4}--ab-/gmv)).toHaveLength(210 + 294);
  expect(css.match(/^ {6}--ab-/gmv)).toHaveLength(22);
  const sheets = Object.values(components).join("");
  expect(sheets.match(/^ {4}--ab-/gmv)).toHaveLength(413 + 79 + 50 + 61 + 24 + 30);
  expect(Object.keys(components)).toHaveLength(45);
});

test("the package's own token source passes every check and compiles", async () => {
  const { css, components } = await buildTokens({ source: [SOURCE_GLOB] });
  expect(components["button"]).toContain(
    "--ab-button-primary-background-color: var(--ab-color-background-accent-bold);",
  );
  expect(css).toContain(
    "--ab-color-background-accent-bold: light-dark(var(--ab-palette-moss-900), var(--ab-palette-lichen-200));",
  );
});
