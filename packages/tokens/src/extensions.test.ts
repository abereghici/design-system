import { expect, test } from "vitest";

import { buildTokens } from "./build.ts";
import { validTokens } from "./test-fixtures.ts";

const media = (overrides: Readonly<Record<string, unknown>>) => ({
  "com.bereghici.media": overrides,
});

test("a media override must reference a token, not hold a literal", async () => {
  const tokens = validTokens();
  tokens.semantic["radius-sm"] = {
    $type: "dimension",
    $value: "{primitive.dimension-8}",
    $extensions: media({ "(pointer: coarse)": "12px" }),
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-radius-sm: the (pointer: coarse) override must reference a primitive or semantic token, not hold a literal",
  );
});

test("a media override cannot reference a component token", async () => {
  const tokens = validTokens();
  tokens.semantic["radius-sm"] = {
    $type: "dimension",
    $value: "{primitive.dimension-8}",
    $extensions: media({ "(pointer: coarse)": "{component.button-border-radius}" }),
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-radius-sm: the (pointer: coarse) override must reference a primitive or semantic token, not a component token",
  );
});

test("only semantic tokens take media overrides", async () => {
  const tokens = validTokens();
  tokens.component["button-border-radius"] = {
    $type: "dimension",
    $value: "{semantic.radius-sm}",
    $extensions: media({ "(pointer: coarse)": "{semantic.radius-sm}" }),
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-button-border-radius: only semantic tokens take media overrides; component tokens follow the semantic tokens they reference",
  );
});

test("only themed colors take a per-Theme media override", async () => {
  const tokens = validTokens();
  tokens.semantic["radius-sm"] = {
    $type: "dimension",
    $value: "{primitive.dimension-8}",
    $extensions: media({
      "(pointer: coarse)": { light: "{primitive.dimension-8}", dark: "{primitive.dimension-8}" },
    }),
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-radius-sm: the (pointer: coarse) override has per-Theme values, but only themed colors are themed",
  );
});

const animated = { "com.bereghici.animated": true };

test("only component tokens can be animated", async () => {
  const tokens = validTokens();
  tokens.semantic["radius-sm"] = {
    $type: "dimension",
    $value: "{primitive.dimension-8}",
    $extensions: animated,
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-radius-sm: only component tokens can be animated",
  );
});

test("an animated token that follows the Theme fails the build", async () => {
  const tokens = validTokens();
  tokens.component["card-background-color"] = {
    $type: "color",
    $value: "{semantic.color-surface-default}",
    $extensions: animated,
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-card-background-color: an animated token needs one value in every Theme",
  );
});

test("an animated token needs a computationally independent value", async () => {
  const tokens = validTokens();
  tokens.primitive["dimension-8"] = { $type: "dimension", $value: { value: 0.5, unit: "rem" } };
  tokens.component["button-border-radius"] = {
    $type: "dimension",
    $value: "{semantic.radius-sm}",
    $extensions: animated,
  };
  await expect(buildTokens({ tokens })).rejects.toThrow(
    "--ab-button-border-radius: 0.5rem is not computationally independent, so it can't be an @property initial-value",
  );
});
