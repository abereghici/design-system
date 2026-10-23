import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import { IconographyGuidelines } from "./brand.tsx";
import { cellText, tokenRow } from "../testing/table.ts";

const meta = preview.meta({ title: "Foundations/Iconography", tags: ["!autodocs"] });

// The construction rules and the tokens icons are drawn with; the icon set is the
// Foundations/Icons gallery (src/icon-gallery), which the Iconography docs page embeds.
export const Guidelines = meta.story({ render: () => <IconographyGuidelines /> });

// icon-md-size = size-icon-md (dimension-20); icon-md-stroke-width = stroke-width-md (1.75).
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
