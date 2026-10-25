import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Text } from "./text.tsx";

const meta = preview.meta({
  title: "Components/Text",
  component: Text,
  args: { children: "Invoices are sent on the first working day of the month." },
});

export const Default = meta.story({});

Default.test("is a paragraph", async ({ canvas }) => {
  await expect(canvas.getByRole("paragraph")).toHaveTextContent(
    "Invoices are sent on the first working day of the month.",
  );
});

Default.test(
  "renders code as a code element",
  { args: { variant: "code", children: "pnpm build" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("code")).toHaveTextContent("pnpm build");
  },
);

Default.test(
  "keeps the source casing of an overline for assistive technology",
  { args: { variant: "overline", as: "span", children: "Recent" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("Recent")).toBeVisible();
  },
);

Default.test(
  "as a label, names its control and focuses it when clicked",
  {
    args: { variant: "label", as: "label", htmlFor: "invoice-email", children: "Email" },
    render: (args) => (
      <>
        <Text {...args} />
        <input id="invoice-email" />
      </>
    ),
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Email"));
    await expect(canvas.getByRole("textbox", { name: "Email" })).toHaveFocus();
  },
);

Default.test(
  "shows data text as written",
  { args: { variant: "data", size: "md", as: "span", children: "1,204.50" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("1,204.50")).toBeVisible();
  },
);

Default.test(
  "sets a display statement as a paragraph",
  { args: { variant: "display", children: "Quiet tools for loud work." } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("paragraph")).toHaveTextContent("Quiet tools for loud work.");
  },
);

Default.test(
  "keeps subtle text readable at AA contrast",
  { args: { size: "sm", color: "subtle" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("paragraph")).toBeVisible();
  },
);

Default.test(
  "keeps subtlest text readable at AA contrast",
  { args: { size: "xs", color: "subtlest" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("paragraph")).toBeVisible();
  },
);
