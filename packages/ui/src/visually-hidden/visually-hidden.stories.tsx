import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { VisuallyHidden } from "./visually-hidden.tsx";

const meta = preview.meta({
  title: "Components/VisuallyHidden",
  component: VisuallyHidden,
  args: { children: " (opens in a new tab)" },
  tags: ["!screenshot"],
});

export const Default = meta.story({});

Default.test("keeps its text for assistive technology but draws nothing", async ({ canvas }) => {
  const text = canvas.getByText("(opens in a new tab)");
  await expect(text.getBoundingClientRect()).toMatchObject({ width: 1, height: 1 });
});

Default.test(
  "hides its child with asChild",
  { args: { asChild: true, children: <h2>Filters</h2> } },
  async ({ canvas }) => {
    const heading = canvas.getByRole("heading", { name: "Filters", level: 2 });
    await expect(heading.getBoundingClientRect()).toMatchObject({ width: 1, height: 1 });
  },
);

export const InALink = meta.story({
  decorators: [
    (Story) => (
      <a href="https://github.com/abereghici" target="_blank" rel="noreferrer">
        GitHub
        <Story />
      </a>
    ),
  ],
  parameters: {
    docs: { description: { story: "Hidden text completes a link's accessible name." } },
  },
});

InALink.test("joins the accessible name of its link", async ({ canvas }) => {
  await expect(canvas.getByRole("link", { name: "GitHub (opens in a new tab)" })).toBeVisible();
});
