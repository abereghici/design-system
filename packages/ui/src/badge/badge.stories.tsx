import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { enUS } from "../provider/locales/en-US.ts";

import { Badge } from "./badge.tsx";

const meta = preview.meta({
  title: "Components/Badge",
  component: Badge,
  args: { children: 3 },
  parameters: {
    docs: {
      description: {
        component:
          'A count or a one-glyph mark ("!") placed next to the tab, nav item or button it counts. A number is formatted with `Intl.NumberFormat` and capped at `max`. It is a Server Component, so pass `locale` to format in the app\'s language. Put the exact count in the owner\'s accessible name ("Inbox, 1 280 unread"). For a static word ("Draft"), use a Tag; for a state marker in a dense list, a StatusDot.',
      },
    },
  },
});

export const Default = meta.story({});

for (const variant of ["neutral", "accent", "danger"] as const) {
  Default.test(`reads at AA contrast as ${variant}`, { args: { variant } }, async ({ canvas }) => {
    await expect(canvas.getByText("3")).toBeVisible();
  });
}

Default.test("caps a count above max", { args: { children: 1280 } }, async ({ canvas }) => {
  await expect(canvas.getByText("99+")).toBeVisible();
});

Default.test(
  "formats the count and the cap in its locale",
  { args: { children: 1280, max: 1000, locale: { ...enUS, tag: "de" } } },
  async ({ canvas }) => {
    await expect(canvas.getByText("1.000+")).toBeVisible();
  },
);

Default.test(
  "formats a count in English without a locale",
  { args: { children: 1280, max: 9999 } },
  async ({ canvas }) => {
    await expect(canvas.getByText("1,280")).toBeVisible();
  },
);

Default.test(
  "takes a translated overflow label",
  { args: { children: 100, labels: { overflow: (max) => `+${max}` } } },
  async ({ canvas }) => {
    await expect(canvas.getByText("+99")).toBeVisible();
  },
);

Default.test(
  "renders a string as given",
  { args: { children: "!", variant: "danger" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("!")).toBeVisible();
  },
);

export const InALink = meta.story({
  decorators: [
    (Story) => (
      <a href="#inbox">
        Inbox <Story />
      </a>
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
