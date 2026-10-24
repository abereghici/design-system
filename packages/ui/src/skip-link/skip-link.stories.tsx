import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { roRO } from "../provider/locales/ro-RO.ts";

import { SkipLink } from "./skip-link.tsx";

const meta = preview.meta({
  title: "Components/SkipLink",
  component: SkipLink,
  args: { href: "#main" as const },
  decorators: [
    (Story) => (
      <>
        <Story />
        <nav aria-label="Primary">
          <a href="#home">Home</a>
        </nav>
        <main id="main" tabIndex={-1}>
          <button type="button">First control</button>
        </main>
      </>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The first element of a page layout: a link to the main content, hidden until it has focus. Give the target `<main>` the matching `id` and `tabIndex={-1}`. For any other navigation, use a Link.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test("is hidden until focused", async ({ canvas }) => {
  const link = canvas.getByRole("link", { name: "Skip to main content" });
  await expect(link.getBoundingClientRect()).toMatchObject({ width: 1, height: 1 });
});

Default.test("is the first tab stop, shown while it has focus", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  const link = canvas.getByRole("link", { name: "Skip to main content" });
  await expect(link).toHaveFocus();
  await expect(link.getBoundingClientRect().width).toBeGreaterThan(1);
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "Home" })).toHaveFocus();
  await expect(link.getBoundingClientRect().width).toBe(1);
});

Default.test(
  "takes its text from labels",
  { args: { labels: roRO.labels.skipLink } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Salt la conținutul principal" })).toBeVisible();
  },
);

Default.test(
  "takes its text from children",
  { args: { children: "Skip to results" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Skip to results" })).toBeVisible();
  },
);
