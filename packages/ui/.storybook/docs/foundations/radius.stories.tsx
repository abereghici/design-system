import { expect, within } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Radius } from "./shape.tsx";

const meta = preview.meta({ title: "Foundations/Radius", tags: ["!autodocs"] });

export const Scale = meta.story({ render: () => <Radius /> });

Scale.test("checks the concentric rule on every nested pair", async ({ canvas }) => {
  const table = within(canvas.getByRole("table", { name: "Concentric pairs" }));
  const rows = table.getAllByRole("row").slice(1);
  await expect(
    rows.map((row) => [
      row.children.item(1)?.firstElementChild?.textContent,
      row.children.item(2)?.textContent,
    ]),
  ).toEqual([
    ["12 − 4 = 8", "Holds"],
    ["12 − 4 = 8", "Holds"],
    ["10 − 2 = 8", "Holds"],
    ["16 − 8 = 8", "Holds"],
  ]);
});
