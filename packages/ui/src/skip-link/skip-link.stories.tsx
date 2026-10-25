import { expect } from "storybook/test";

import { Button } from "@platform/ui/button";

import preview from "#.storybook/preview.tsx";

import { roRO } from "../ui-provider/locales/ro-RO.ts";

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
          <Button type="button">First control</Button>
        </main>
      </>
    ),
  ],
});

export const Default = meta.story({});

/** What a pointer finds at the link's centre: the link only while it is shown. */
const atCentre = (element: Element) => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return document.elementFromPoint(x + width / 2, y + height / 2);
};

Default.test("is hidden until focused", async ({ canvas }) => {
  const link = canvas.getByRole("link", { name: "Skip to main content" });
  await expect(atCentre(link)).not.toBe(link);
});

Default.test("is the first tab stop, shown while it has focus", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  const link = canvas.getByRole("link", { name: "Skip to main content" });
  await expect(link).toHaveFocus();
  await expect(atCentre(link)).toBe(link);
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "Home" })).toHaveFocus();
  await expect(atCentre(link)).not.toBe(link);
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
