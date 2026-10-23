import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import { LogoGuidelines } from "./brand.tsx";
import { cellText, tokenRow } from "../testing/table.ts";

const meta = preview.meta({ title: "Foundations/Logo", tags: ["!autodocs"] });

// The Logo component and its SVGs come with the icon and Logo pipeline; this story shows the
// rules and tokens that exist, and gains the rendered Logo when that lands.
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
