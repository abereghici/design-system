import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

import { IconographyGuidelines } from "./brand.tsx";
import { cellText, tokenRow } from "./table.ts";

const meta = preview.meta({ title: "Foundations/Iconography", tags: ["!autodocs"] });

export const Guidelines = meta.story({ render: () => <IconographyGuidelines /> });

Guidelines.test("lists the icon sizes and strokes", async ({ canvas }) => {
  const table = canvas.getByRole("table", { name: "Icon tokens" });
  const value = (name: string) => cellText(table, tokenRow(name), "Value");
  await expect([
    value("icon-md-size"),
    value("icon-md-stroke-width"),
    value("size-icon-md"),
    value("stroke-width-md"),
  ]).toEqual(["size-icon-md", "stroke-width-md", "dimension-20", "stroke-width-175"]);
});
