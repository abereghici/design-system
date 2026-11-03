import { expect } from "storybook/test";

import { ArrowUpRightIcon } from "@abereghici/ui/icons/arrow-up-right";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview from "#.storybook/preview.tsx";

import { Link } from "./link.tsx";

const meta = preview.meta({
  title: "Components/Link",
  component: Link,
  args: { href: "#token-guide", children: "token guide" },
});

export const Default = meta.story({});

Default.test(
  "names itself from its text, not its icon",
  {
    args: {
      href: "https://github.com/abereghici",
      target: "_blank",
      children: (
        <>
          GitHub (opens in a new tab) <ArrowUpRightIcon data-icon="inline-end" />
        </>
      ),
    },
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "GitHub (opens in a new tab)" })).toBeVisible();
  },
);

Default.test(
  "renders its child with asChild",
  { args: { asChild: true, children: <a href="#settings">Settings</a> } },
  async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")).toEqual([
      canvas.getByRole("link", { name: "Settings" }),
    ]);
  },
);

export const InText = meta.story({
  decorators: [
    (Story) => (
      <p>
        Read the <Story /> first.
      </p>
    ),
  ],
  parameters: {
    docs: { description: { story: "A link in running text takes the paragraph's type." } },
  },
});

export const WorstCase = meta.story({
  tags: ["!autodocs"],
  args: {
    href: "#board-pack",
    children:
      "https://files.northwind-industries-holdings.example.com/workspaces/1284/documents/q3-2026-board-pack-final-revised-v12.pdf",
  },
  decorators: [withWidth("18rem")],
});
