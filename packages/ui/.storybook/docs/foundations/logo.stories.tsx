import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { LogoGuidelines, LogoSpecimen } from "./brand.tsx";
import { cellText, tokenRow } from "./table.ts";

const meta = preview.meta({ title: "Foundations/Logo", tags: ["!autodocs"] });

export const Sizes = meta.story({ render: () => <LogoSpecimen /> });

Sizes.test("draws the Logo at the brand book's sizes", async ({ canvas }) => {
  const sizes = canvas
    .getAllByRole("img", { name: /^Bereghici Logo, \d+px$/v })
    .map((logo) => logo.getBoundingClientRect().width);
  await expect(sizes).toEqual([16, 24, 32, 48]);
});

export const Guidelines = meta.story({ render: () => <LogoGuidelines /> });

Guidelines.test("lists the Logo's size, stroke and colors", async ({ canvasElement }) => {
  const value = (name: string) => cellText(canvasElement, tokenRow(name), "Value");
  await expect([
    value("logo-min-size"),
    value("logo-stroke-width"),
    value("size-mark-min"),
  ]).toEqual(["size-mark-min", "stroke-width-2xl", "dimension-16"]);
});
