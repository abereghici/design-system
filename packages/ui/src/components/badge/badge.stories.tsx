import { expect } from "storybook/test";

import type { StoryContext } from "@storybook/react-vite";

import { Link } from "@abereghici/ui/link";

import preview from "#.storybook/preview.tsx";

import { Badge } from "./badge.tsx";

async function showsCount({ canvas }: StoryContext) {
  await expect(canvas.getByText("3")).toBeVisible();
}

const meta = preview.meta({
  title: "Components/Badge",
  component: Badge,
  args: { children: 3 },
});

export const Default = meta.story({});

Default.test("reads at AA contrast as accent", { args: { variant: "accent" } }, showsCount);

Default.test("reads at AA contrast as danger", { args: { variant: "danger" } }, showsCount);

Default.test("caps a count above max", { args: { children: 1280 } }, async ({ canvas }) => {
  await expect(canvas.getByText("99+")).toBeVisible();
});

Default.test(
  "formats the count and the cap in the app's locale",
  { globals: { locale: "ro-RO" }, args: { children: 1280, max: 1000 } },
  async ({ canvas }) => {
    await expect(canvas.getByText("1.000+")).toBeVisible();
  },
);

Default.test(
  "formats a count in the app's locale",
  { args: { children: 1280, max: 9999 } },
  async ({ canvas }) => {
    await expect(canvas.getByText("1,280")).toBeVisible();
  },
);

export const InALink = meta.story({
  decorators: [
    (Story) => (
      <Link href="#inbox">
        Inbox <Story />
      </Link>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Without an `aria-label` on its owner, the count joins the owner\'s name ("Inbox 3").',
      },
    },
  },
});

InALink.test("joins its owner's accessible name", async ({ canvas }) => {
  await expect(canvas.getByRole("link", { name: "Inbox 3" })).toBeVisible();
});
