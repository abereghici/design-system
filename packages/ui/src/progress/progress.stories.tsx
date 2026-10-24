import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

import { roRO } from "../provider/locales/ro-RO.ts";
import { Progress } from "./progress.tsx";

const meta = preview.meta({
  title: "Components/Progress",
  component: Progress,
  args: { value: 40, label: "Uploading 3 files" },
  parameters: {
    docs: {
      description: {
        component:
          "How far a task has got, or that it is running when `value` is `null`. The value text is formatted with `Intl.NumberFormat` on the server, in English unless you pass a shipped `locale`. For a short wait inside a control use Spinner or Button's `loading`; for a measurement that isn't progress use Meter.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test("is a progressbar named by its label, with its value", async ({ canvas }) => {
  const bar = canvas.getByRole("progressbar", { name: "Uploading 3 files" });
  await expect(bar).toHaveAttribute("aria-valuenow", "40");
  await expect(bar).toHaveAttribute("aria-valuemax", "100");
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
    await expect(
      canvas.getByRole("progressbar", { name: "Importing contacts" }),
    ).not.toHaveAttribute("aria-valuenow");
  },
);

Default.test(
  "sweeps only when motion is allowed",
  { args: { value: null } },
  async ({ canvas }) => {
    const sweeping = canvas
      .getByRole("progressbar")
      .getAnimations({ subtree: true })
      .some(
        ({ effect }) =>
          effect instanceof KeyframeEffect &&
          effect.getKeyframes().some((frame) => "translate" in frame),
      );
    await expect(sweeping).toBe(!matchMedia("(prefers-reduced-motion: reduce)").matches);
  },
);

Default.test("is full when complete", { args: { value: 100 } }, async ({ canvas }) => {
  await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  await expect(canvas.getByText("100%")).toBeVisible();
});

Default.test("clamps its value to the range", { args: { value: 140 } }, async ({ canvas }) => {
  await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
});

Default.test(
  "formats its value in the given locale",
  { args: { locale: roRO, label: "Se încarcă 3 fișiere" } },
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
