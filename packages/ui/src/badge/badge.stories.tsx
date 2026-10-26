import { expect } from "storybook/test";

import { Link } from "@platform/ui/link";

import preview from "#.storybook/preview.tsx";

import { Badge } from "./badge.tsx";

const meta = preview.meta({
  title: "Components/Badge",
  component: Badge,
  args: { children: 3, locale: "en-US" },
});

export const Default = meta.story({});

Default.test(
  "reads at AA contrast as accent",
  { args: { variant: "accent" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("3")).toBeVisible();
  },
);

Default.test(
  "reads at AA contrast as danger",
  { args: { variant: "danger" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("3")).toBeVisible();
  },
);

Default.test("caps a count above max", { args: { children: 1280 } }, async ({ canvas }) => {
  await expect(canvas.getByText("99+")).toBeVisible();
});

Default.test(
  "formats the count and the cap in its locale",
  { args: { children: 1280, max: 1000, locale: "ro-RO" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("1.000+")).toBeVisible();
  },
);

Default.test(
  "formats a count in its locale",
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
