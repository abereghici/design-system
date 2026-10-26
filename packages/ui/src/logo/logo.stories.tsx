import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Logo } from "./logo.tsx";

const meta = preview.meta({
  title: "Components/Logo",
  component: Logo,
  // Decorative by default, so its tree is empty, and an empty aria snapshot matches anything.
  tags: ["!aria-snapshot"],
});

export const Default = meta.story({});

Default.test("is hidden from assistive technology by default", async ({ canvas }) => {
  await expect(canvas.queryByRole("img")).toBeNull();
});

Default.test(
  "announces its label as an image",
  { args: { label: "Bereghici" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Bereghici" })).toBeVisible();
  },
);
