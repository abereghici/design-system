import { expect, within } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { ContrastMatrix, FocusAndTarget } from "./accessibility.tsx";
import { cellText } from "./table.ts";

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
    cellText(
      canvas.getByRole("region", { name: `${theme} Theme` }),
      new RegExp(`^${row} `, "v"),
      column,
    );
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

export const Focus = meta.story({ render: () => <FocusAndTarget /> });
