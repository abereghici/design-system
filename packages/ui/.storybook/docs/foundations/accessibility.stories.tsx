import preview from "#.storybook/preview.tsx";
import { expect, within } from "storybook/test";

import { ContrastMatrix, FocusAndTarget } from "./accessibility.tsx";

const meta = preview.meta({
  title: "Foundations/Accessibility",
  tags: ["!autodocs"],
});

export const Contrast = meta.story({ render: () => <ContrastMatrix /> });

Contrast.test("lists every pair of the AA matrix in both Themes", async ({ canvas }) => {
  for (const theme of ["Light", "Dark"]) {
    const table = within(canvas.getByRole("region", { name: `${theme} Theme` }));
    await expect(table.getAllByRole("cell", { name: /:1/v })).toHaveLength(218);
  }
});

Contrast.test("shows the computed ratio of each pair", async ({ canvas }) => {
  const cell = (theme: string, row: string, column: string) =>
    within(canvas.getByRole("region", { name: `${theme} Theme` }))
      .getByRole("row", { name: new RegExp(`^${row} `, "v") })
      .querySelector(`[data-background="${column}"]`)?.textContent;
  await expect([
    cell("Light", "text-subtlest", "background-neutral-subtle-pressed"),
    cell("Light", "border-warning", "background-neutral-subtle-pressed"),
    cell("Dark", "text-subtlest", "background-accent-subtle"),
    cell("Dark", "border-default", "background-accent-subtle"),
  ]).toEqual(["4.56:1", "3.05:1", "4.58:1", "3.06:1"]);
});

Contrast.test("finds no pair below its minimum", async ({ canvas }) => {
  await expect(canvas.queryAllByRole("cell", { name: /below/v })).toEqual([]);
});

Contrast.test("paints each table in its own Theme", async ({ canvas }) => {
  const background = (theme: string) =>
    getComputedStyle(canvas.getByRole("region", { name: `${theme} Theme` })).backgroundColor;
  await expect([background("Light"), background("Dark")]).toEqual([
    "rgb(255, 255, 255)",
    "rgb(18, 21, 15)",
  ]);
});

export const Focus = meta.story({ render: () => <FocusAndTarget /> });
