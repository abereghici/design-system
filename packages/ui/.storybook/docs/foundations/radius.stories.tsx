import preview from "#.storybook/preview.tsx";
import { expect, within } from "storybook/test";

import { Radius } from "./shape.tsx";

const meta = preview.meta({ title: "Foundations/Radius", tags: ["!autodocs"] });

export const Scale = meta.story({ render: () => <Radius /> });

// Component tokens: dropdown-menu / context-menu radius-lg 12 − space-inset-xs 4 = radius-sm 8;
// segmented-control radius-md 10 − space-inset-2xs 2 = radius-sm 8; command radius-xl 16 −
// space-inset-sm 8 = radius-sm 8.
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
