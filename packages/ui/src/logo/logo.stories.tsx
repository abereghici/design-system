import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

import { Logo } from "./logo.tsx";

const meta = preview.meta({
  title: "Components/Logo",
  component: Logo,
  parameters: {
    docs: {
      description: {
        component:
          "Stâlpul cerului, the Bereghici Logo, in `--ab-logo-color`. 32px by default; resize it with `width` and `height`, never below 16px. For an interface glyph, use an icon.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test("is hidden from assistive technology by default", async ({ canvas }) => {
  await expect(canvas.queryByRole("img")).toBeNull();
});

Default.test(
  "announces its label as an image",
  { args: { label: "Bereghici" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Bereghici" })).toBeVisible();
  },
);
