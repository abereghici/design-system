import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Separator } from "./separator.tsx";

const meta = preview.meta({
  title: "Components/Containers/Separator",
  component: Separator,
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: "1rem" }}>
        <p>Billing</p>
        <Story />
        <p>Security</p>
      </div>
    ),
  ],
});

export const Default = meta.story({});

Default.test("is announced as a separator", async ({ canvas }) => {
  await expect(canvas.getByRole("separator")).not.toHaveAttribute("aria-orientation");
});

Default.test(
  "is hidden from assistive technology when decorative",
  { args: { decorative: true } },
  async ({ canvas }) => {
    await expect(canvas.queryByRole("separator")).toBeNull();
  },
);

Default.test(
  "stays a separator with the ornament",
  { args: { variant: "ornament" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toBeVisible();
    // @ts-expect-error The ornament is horizontal only.
    void (<Separator orientation="vertical" variant="ornament" />);
  },
);

export const BetweenGroups = meta.story({
  args: { orientation: "vertical" },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <span>Bold</span>
        <Story />
        <span>Undo</span>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Vertical, it stretches to the height of the row it divides, as between toolbar groups.",
      },
    },
  },
});

BetweenGroups.test("announces its vertical orientation", async ({ canvas }) => {
  const separator = canvas.getByRole("separator");
  await expect(separator).toHaveAttribute("aria-orientation", "vertical");
  await expect(separator).toBeVisible();
});
