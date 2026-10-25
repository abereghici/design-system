import { expect, test } from "vitest";

import { buildTokens, TokenCheckError } from "./build.ts";
import { setMember, srgb, themed, validTokens } from "./test-fixtures.ts";
import componentTokens from "./tokens/component.tokens.json" with { type: "json" };
import primitiveTokens from "./tokens/primitive.tokens.json" with { type: "json" };
import semanticTokens from "./tokens/semantic.tokens.json" with { type: "json" };

test("a component token that skips the semantic tier fails the build", async () => {
  const tokens = validTokens();

  tokens.component["card-background-color"] = {
    $type: "color",
    $value: "{primitive.palette-moss-900}",
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-card-background-color: a component token must reference a semantic token, not a primitive token",
  );
});

test("a semantic token holding a literal fails the build", async () => {
  const tokens = validTokens();

  tokens.semantic["radius-md"] = { $type: "dimension", $value: { value: 10, unit: "px" } };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-radius-md: a semantic token must reference a primitive token, not hold a literal",
  );
});

test("a primitive token that references another token fails the build", async () => {
  const tokens = validTokens();

  tokens.primitive["palette-moss-950"] = {
    $type: "color",
    $value: "{primitive.palette-moss-900}",
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-palette-moss-950: a primitive token must hold a literal, not reference another token",
  );
});

test("every problem is reported at once, as a TokenCheckError", async () => {
  const tokens = validTokens();

  tokens.component["card-background-color"] = {
    $type: "color",
    $value: "{primitive.palette-moss-900}",
  };
  tokens.component["button-border-radius"] = {
    $type: "dimension",
    $value: "{primitive.dimension-8}",
  };

  const build = buildTokens({ tokens });

  await expect(build).rejects.toBeInstanceOf(TokenCheckError);
  await expect(build).rejects.toHaveProperty("problems", [
    "--ab-button-border-radius: a component token must reference a semantic token, not a primitive token",
    "--ab-card-background-color: a component token must reference a semantic token, not a primitive token",
  ]);
});

test("a type style may use its own semantic font size, but no other semantic token", async () => {
  const tokens = validTokens();

  setMember(tokens.semantic, "type-label-sm", "fontWeight", "{semantic.radius-sm}");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-type-label-sm: a semantic token must reference a primitive token, not a semantic token",
  );
});

test("a composite member holding a literal fails the build", async () => {
  const tokens = validTokens();

  setMember(tokens.semantic, "type-label-sm", "lineHeight", 1.2);
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-type-label-sm: a semantic token must reference a primitive token, not hold a literal",
  );
});

test("an Elevation may compose the ring and shadow colors, but no other semantic color", async () => {
  const tokens = validTokens();

  setMember(tokens.semantic, "elevation-ring", "color", "{semantic.color-text-default}");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-elevation-ring: a semantic token must reference a primitive token, not a semantic token",
  );
});

test("a semantic color name with a word outside the Dictionary fails the build", async () => {
  const tokens = validTokens();

  tokens.semantic["color-text-shiny"] = themed("palette-sage-950", "palette-night-50");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-color-text-shiny: uses words outside the Dictionary: shiny",
  );
});

test("a component token name with a word outside the Dictionary fails the build", async () => {
  const tokens = validTokens();

  tokens.component["button-huge-border-radius"] = {
    $type: "dimension",
    $value: "{semantic.radius-sm}",
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-button-huge-border-radius: uses words outside the Dictionary: huge",
  );
});

test("a primitive name outside the tier grammar fails the build", async () => {
  const tokens = validTokens();

  tokens.primitive["moss-dark"] = { $type: "color", $value: srgb("#263316") };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-moss-dark: does not match the primitive grammar",
  );
});

test("component tokens use the spec's component names", async () => {
  const tokens = validTokens();

  for (const component of ["separator", "dropdown-menu", "context-menu", "command", "logo"]) {
    tokens.component[`${component}-border-color`] = {
      $type: "color",
      $value: "{semantic.color-border-default}",
    };
  }

  tokens.semantic["color-border-default"] = themed("palette-sage-950", "palette-night-50");
  await expect(buildTokens({ tokens })).resolves.toBeDefined();
});

test.each([
  ["divider", "names no component in the Dictionary"],
  ["menu", "names no component in the Dictionary"],
  ["mark", "names no component in the Dictionary"],
  ["command-palette", "uses words outside the Dictionary: palette"],
])("the source's old component name %s is outside the Dictionary", async (component, problem) => {
  const tokens = validTokens();

  tokens.component[`${component}-border-radius`] = {
    $type: "dimension",
    $value: "{semantic.radius-sm}",
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    `--ab-${component}-border-radius: ${problem}`,
  );
});

test("stroke-width-2xl, used by the Logo, is a valid semantic name", async () => {
  const tokens = validTokens();

  tokens.primitive["stroke-width-300"] = { $type: "number", $value: 3 };
  tokens.semantic["stroke-width-2xl"] = { $type: "number", $value: "{primitive.stroke-width-300}" };
  await expect(buildTokens({ tokens })).resolves.toBeDefined();
});

test("a themed color without a dark Theme value fails the build", async () => {
  const tokens = validTokens();

  tokens.semantic["color-text-subtle"] = {
    $type: "color",
    $value: "{primitive.palette-sage-950}",
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    '--ab-color-text-subtle: a themed color needs a value for every Theme; missing: dark (add $extensions["com.bereghici.theme"].dark)',
  );
});

test("brand colors are fixed, so they need no dark value", async () => {
  await expect(buildTokens({ tokens: validTokens() })).resolves.toBeDefined();
});

test("a component token cannot carry its own Theme values", async () => {
  const tokens = validTokens();

  tokens.component["card-background-color"] = {
    $type: "color",
    $value: "{semantic.color-surface-default}",
    $extensions: { "com.bereghici.theme": { dark: "{semantic.color-text-default}" } },
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-card-background-color: only semantic colors are themed; component tokens follow the semantic tokens they reference",
  );
});

test("a contrast pair whose token is missing fails the build", async () => {
  const tokens = validTokens();

  delete tokens.semantic["color-text-on-highlight"];
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[light] --ab-color-text-on-highlight on --ab-color-background-highlight: --ab-color-text-on-highlight is not defined, so the pair can't be checked",
  );
});

test("a translucent color in the contrast matrix fails the build", async () => {
  const tokens = validTokens();

  tokens.semantic["color-surface-raised"] = themed("palette-sage-0-a90", "palette-night-900");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[light] --ab-color-text-default on --ab-color-surface-raised: cannot check contrast of #171914 on rgba(255, 255, 255, 0.9) (needs opaque sRGB colors)",
  );
});

test("the source's full matrix passes in both Themes", async () => {
  await expect(buildTokens({ tokens: validTokens() })).resolves.toBeDefined();
});

test("a text pair below 4.5:1 in one Theme fails the build", async () => {
  const tokens = validTokens();

  tokens.semantic["color-text-default"] = themed("palette-sage-950", "palette-night-950");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[dark] --ab-color-text-default on --ab-color-surface-default: 1.00:1, needs 4.5:1",
  );
});

test("contrast follows the WCAG 2.2 formula and a near miss still fails", async () => {
  const tokens = validTokens();

  tokens.primitive["palette-sage-400"] = { $type: "color", $value: srgb("#777777") };
  tokens.semantic["color-text-subtle"] = themed("palette-sage-400", "palette-night-50");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[light] --ab-color-text-subtle on --ab-color-surface-default: 4.48:1, needs 4.5:1",
  );
});

test("a non-text pair below 3:1 fails the build", async () => {
  const tokens = validTokens();

  tokens.semantic["color-border-default"] = themed("palette-sage-0", "palette-night-50");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[light] --ab-color-border-default on --ab-color-surface-default: 1.00:1, needs 3:1",
  );
});

test("a status icon is checked at 3:1 against its subtle fill", async () => {
  const tokens = validTokens();

  tokens.semantic["color-background-danger-subtle"] = themed("palette-clay-50", "palette-clay-300");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[dark] --ab-color-icon-danger on --ab-color-background-danger-subtle: 1.00:1, needs 3:1",
  );
});

test("subtle text is checked at 4.5:1 against a status subtle fill", async () => {
  const tokens = validTokens();

  tokens.semantic["color-background-success-subtle"] = themed(
    "palette-fern-50",
    "palette-night-300",
  );
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[dark] --ab-color-text-subtle on --ab-color-background-success-subtle: 1.00:1, needs 4.5:1",
  );
});

test("the checked accent fill is checked at 3:1 against each surface", async () => {
  const tokens = validTokens();

  tokens.semantic["color-background-accent-bold"] = themed("palette-moss-900", "palette-night-900");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[dark] --ab-color-background-accent-bold on --ab-color-surface-floating: 1.00:1, needs 3:1",
  );
});

test("the Switch and Slider thumb is checked at 3:1 against the accent fill", async () => {
  const tokens = validTokens();

  tokens.semantic["color-surface-floating"] = themed("palette-sage-0", "palette-night-50");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[dark] --ab-color-surface-floating on --ab-color-background-accent-bold:",
  );
});

test("an on-{role} pair is checked against its bold fill", async () => {
  const tokens = validTokens();

  tokens.semantic["color-background-accent-bold"] = themed("palette-moss-900", "palette-night-50");
  tokens.semantic["color-text-on-accent"] = themed("palette-sage-0", "palette-night-50");
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "[dark] --ab-color-text-on-accent on --ab-color-background-accent-bold: 1.00:1, needs 4.5:1",
  );
});

const tiers: Record<string, Record<string, { $value: unknown }>> = {
  primitive: primitiveTokens.primitive,
  semantic: semanticTokens.semantic,
  component: componentTokens.component,
};

function px(reference: string): number {
  const [tier = "", name = ""] = reference.slice(1, -1).split(".");
  const value = tiers[tier]?.[name]?.$value;

  return typeof value === "string" ? px(value) : Number(Reflect.get(new Object(value), "value"));
}

test.each([
  ["dropdown-menu-border-radius", "dropdown-menu-padding", "dropdown-menu-item-border-radius"],
  ["context-menu-border-radius", "context-menu-padding", "context-menu-item-border-radius"],
  [
    "segmented-control-border-radius",
    "segmented-control-padding",
    "segmented-control-item-border-radius",
  ],
  ["command-border-radius", "command-list-padding", "command-item-border-radius"],
])("concentric corners: %s minus %s is %s", (outer, padding, inner) => {
  expect(px(`{component.${outer}}`) - px(`{component.${padding}}`)).toBe(
    px(`{component.${inner}}`),
  );
});
