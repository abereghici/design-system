import { expect } from "storybook/test";

import { CheckIcon } from "@abereghici/ui/icons/check";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview from "#.storybook/preview.tsx";

import { Tag } from "./tag.tsx";

const meta = preview.meta({
  title: "Components/Tag",
  component: Tag,
  args: { children: "Draft" },
});

export const Default = meta.story({});

Default.test(
  "reads at AA contrast as accent",
  { args: { variant: "accent" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("Draft")).toBeVisible();
  },
);

Default.test(
  "reads at AA contrast as success",
  { args: { variant: "success" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("Draft")).toBeVisible();
  },
);

Default.test(
  "reads at AA contrast as warning",
  { args: { variant: "warning" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("Draft")).toBeVisible();
  },
);

Default.test(
  "reads at AA contrast as danger",
  { args: { variant: "danger" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("Draft")).toBeVisible();
  },
);

export const LongLabel = meta.story({
  args: { children: "Awaitingsecondreviewerapproval" },
  decorators: [withWidth("8rem")],
  parameters: {
    docs: {
      description: { story: "A label longer than its container wraps instead of overflowing." },
    },
  },
});

export const WithIcon = meta.story({
  args: {
    variant: "success",
    children: (
      <>
        <CheckIcon /> Live
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "An icon is a child before the label. It is decorative and takes the label colour.",
      },
    },
  },
});

WithIcon.test("hides its icon from assistive technology", async ({ canvas }) => {
  await expect(canvas.queryByRole("img")).toBeNull();
  await expect(canvas.getByText("Live")).toBeVisible();
});
