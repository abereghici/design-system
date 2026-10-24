import preview from "#.storybook/preview.tsx";
import { expect, within } from "storybook/test";

import { Space } from "./shape.tsx";
import { cellText, tokenRow } from "./table.ts";

const meta = preview.meta({ title: "Foundations/Space", tags: ["!autodocs"] });

export const Scale = meta.story({ render: () => <Space /> });

Scale.test("lists the semantic space with its narrow-viewport override", async ({ canvas }) => {
  const table = within(canvas.getByRole("table", { name: "Semantic space" }));
  await expect(table.getAllByRole("rowheader")).toHaveLength(18);
  await expect(
    cellText(
      canvas.getByRole("table", { name: "Semantic space" }),
      tokenRow("space-section"),
      "Value",
    ),
  ).toBe("dimension-88(width < 760px): dimension-64");
});
