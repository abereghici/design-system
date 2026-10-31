import { expect } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import preview from "#.storybook/preview.tsx";

import { Heading } from "./heading.tsx";

const withOverdueSection: Decorator = (Story) => (
  <section aria-labelledby="overdue">
    <Story />
  </section>
);

const meta = preview.meta({
  title: "Components/Heading",
  component: Heading,
  args: { as: "h2" as const, children: "Overdue invoices" },
});

export const Default = meta.story({});

Default.test(
  "keeps its level when its size differs",
  { args: { as: "h1", size: "xs" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Overdue invoices" })).toBeVisible();
  },
);

Default.test(
  "names the section it titles through its id",
  {
    args: { id: "overdue" },
    decorators: [withOverdueSection],
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Overdue invoices" })).toBeVisible();
  },
);
