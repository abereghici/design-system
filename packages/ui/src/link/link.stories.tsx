import { expect } from "storybook/test";

import { ArrowUpRightIcon } from "@platform/ui/icons/arrow-up-right";

import preview from "#.storybook/preview.tsx";

import { Link } from "./link.tsx";

const meta = preview.meta({
  title: "Components/Navigation/Link",
  component: Link,
  args: { href: "#token-guide", children: "token guide" },
});

export const Default = meta.story({});

Default.test("is a link named by its text and reached with Tab", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("link", { name: "token guide" })).toHaveFocus();
});

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
