import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Heading } from "./heading.tsx";

const meta = preview.meta({
  title: "Components/Heading",
  component: Heading,
  args: { as: "h2" as const, children: "Overdue invoices" },
});

export const Default = meta.story({});

Default.test("is a heading at the level `as` names", async ({ canvas }) => {
  await expect(canvas.getByRole("heading", { level: 2, name: "Overdue invoices" })).toBeVisible();
});

Default.test(
  "keeps its level when its size differs",
  { args: { as: "h1", size: "xs" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Overdue invoices" })).toBeVisible();
  },
);

Default.test(
  "passes native attributes through",
  { args: { id: "overdue" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("heading")).toHaveAttribute("id", "overdue");
  },
);
