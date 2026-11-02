import { expect } from "storybook/test";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview from "#.storybook/preview.tsx";
import { motionAllowed, moves } from "#.storybook/test/motion.ts";

import { Progress } from "./progress.tsx";

const meta = preview.meta({
  title: "Components/Progress",
  component: Progress,
  args: { value: 40, label: "Uploading 3 files" },
});

export const Default = meta.story({});

Default.test("is a progressbar named by its label, with its value", async ({ canvas }) => {
  const bar = canvas.getByRole("progressbar", { name: "Uploading 3 files" });

  await expect(bar).toHaveProperty("value", 40);
  await expect(bar).toHaveProperty("max", 100);
  await expect(canvas.getByText("40%")).toBeVisible();
});

Default.test(
  "reads a string valueLabel as its value text",
  { args: { value: 3, max: 4, label: "Setup", valueLabel: "Step 3 of 4" } },
  async ({ canvas }) => {
    const bar = canvas.getByRole("progressbar", { name: "Setup" });

    await expect(bar).toHaveAttribute("aria-valuetext", "Step 3 of 4");
    await expect(canvas.getByText("Step 3 of 4")).toBeVisible();
  },
);

Default.test(
  "has no value while indeterminate",
  { args: { value: null, label: undefined, "aria-label": "Importing contacts" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar", { name: "Importing contacts" })).toHaveProperty(
      "position",
      -1,
    );
  },
);

Default.test(
  "sweeps only when motion is allowed",
  { args: { value: null } },
  async ({ canvasElement }) => {
    await expect(moves(canvasElement)).toBe(motionAllowed());
  },
);

Default.test("is full when complete", { args: { value: 100 } }, async ({ canvas }) => {
  await expect(canvas.getByRole("progressbar")).toHaveProperty("value", 100);
  await expect(canvas.getByText("100%")).toBeVisible();
});

Default.test("clamps its value to the range", { args: { value: 140 } }, async ({ canvas }) => {
  await expect(canvas.getByRole("progressbar")).toHaveProperty("value", 100);
});

Default.test(
  "formats its value in the app's locale",
  { globals: { locale: "ro-RO" }, args: { label: "Se încarcă 3 fișiere" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("40 %")).toBeVisible();
  },
);

Default.test(
  "formats the value itself when the style isn't percent",
  { args: { value: 3, max: 4, formatOptions: { style: "decimal" } } },
  async ({ canvas }) => {
    await expect(canvas.getByText("3")).toBeVisible();
  },
);

export const WorstCase = meta.story({
  tags: ["!autodocs"],
  args: {
    value: 1,
    max: 1284,
    label:
      "Importing invoices from bartholomew.fitzgerald@northwind-industries-holdings.example.com",
    valueLabel: "1 of 1,284 files",
  },
  decorators: [withWidth("18rem")],
});
