import preview from "#.storybook/preview.tsx";
import { expect, within } from "storybook/test";

import { ColorRoles, Palettes } from "./color.tsx";
import { cellText, tokenRow } from "./table.ts";

const meta = preview.meta({
  title: "Foundations/Color",
  tags: ["!autodocs"],
});

export const Roles = meta.story({ render: () => <ColorRoles /> });

// Semantic color tokens per property in packages/tokens/src/tokens/semantic.tokens.json.
Roles.test("lists every interface color role by property", async ({ canvas }) => {
  const rows = (caption: string) =>
    within(canvas.getByRole("table", { name: caption })).getAllByRole("rowheader").length;
  await expect(
    ["Surface", "Background", "Text", "Icon", "Border", "Brand"].map((caption) => rows(caption)),
  ).toEqual([4, 19, 15, 10, 10, 5]);
});

// color-text-default: light palette-sage-950, dark palette-night-50; color-brand-moss is fixed.
Roles.test("shows each role's value in both Themes", async ({ canvasElement }) => {
  const value = (name: string) => cellText(canvasElement, tokenRow(name), "Value");
  await expect([value("color-text-default"), value("color-brand-moss")]).toEqual([
    "palette-sage-950 light · palette-night-50 dark",
    "palette-moss-900",
  ]);
});

export const Palette = meta.story({ render: () => <Palettes /> });

// Primitive palette steps per hue (notes/source-artifact.md: night 22, sage 19, moss 14, and 11
// each for lichen, fern, ember and clay).
Palette.test("shows every palette step", async ({ canvas }) => {
  const steps = (hue: string) =>
    within(canvas.getByRole("table", { name: hue })).getAllByRole("rowheader").length;
  await expect(
    ["Sage", "Night", "Moss", "Lichen", "Fern", "Ember", "Clay"].map((hue) => steps(hue)),
  ).toEqual([19, 22, 14, 11, 11, 11, 11]);
});
