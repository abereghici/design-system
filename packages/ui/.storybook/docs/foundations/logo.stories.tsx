import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

import { LogoGuidelines, LogoSpecimen } from "./brand.tsx";
import { cellText, tokenRow } from "./table.ts";

const meta = preview.meta({ title: "Foundations/Logo", tags: ["!autodocs"] });

export const Sizes = meta.story({ render: () => <LogoSpecimen /> });

// The brand book's Logo card: "16 · 24 · 32 · 48 px" (archived/guidelines/brand-mark.html).
Sizes.test("draws the Logo at the brand book's sizes", async ({ canvas }) => {
  const sizes = canvas
    .getAllByRole("img", { name: /^Bereghici Logo, \d+px$/v })
    .map((logo) => logo.getBoundingClientRect().width);
  await expect(sizes).toEqual([16, 24, 32, 48]);
});

// color-brand-moss = palette-moss-900 #263316, color-brand-lichen = palette-lichen-100 #f0efd0.
Sizes.test("draws the brand-color Logos on imagery grounds", async ({ canvas }) => {
  const color = (name: string) => getComputedStyle(canvas.getByRole("img", { name })).color;
  await expect([
    color("Bereghici Logo, brand moss"),
    color("Bereghici Logo, brand lichen"),
  ]).toEqual(["rgb(38, 51, 22)", "rgb(240, 239, 208)"]);
});

export const Guidelines = meta.story({ render: () => <LogoGuidelines /> });

// logo-min-size = size-mark-min = dimension-16 (16px); logo-stroke-width = stroke-width-2xl.
Guidelines.test("lists the Logo's size, stroke and colors", async ({ canvasElement }) => {
  const value = (name: string) => cellText(canvasElement, tokenRow(name), "Value");
  await expect([
    value("logo-min-size"),
    value("logo-stroke-width"),
    value("size-mark-min"),
  ]).toEqual(["size-mark-min", "stroke-width-2xl", "dimension-16"]);
});
