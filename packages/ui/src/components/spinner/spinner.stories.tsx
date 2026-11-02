import { expect } from "storybook/test";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview from "#.storybook/preview.tsx";
import { motionAllowed, moves } from "#.storybook/test/motion.ts";

import { Spinner } from "./spinner.tsx";

const meta = preview.meta({
  title: "Components/Spinner",
  component: Spinner,
  args: { children: "Loading" },
});

export const Default = meta.story({});

Default.test(
  "is hidden from assistive technology when decorative",
  { args: { "aria-hidden": true, children: undefined } },
  async ({ canvas }) => {
    await expect(canvas.queryByRole("status", { hidden: true })).toBeNull();
  },
);

Default.test("turns only when motion is allowed", async ({ canvas }) => {
  await expect(moves(canvas.getByRole("status"))).toBe(motionAllowed());
});

export const WorstCase = meta.story({
  tags: ["!autodocs"],
  args: { children: "Synchronisation de 1 284 documents depuis Northwind Industries Holdings…" },
  decorators: [withWidth("18rem")],
});
