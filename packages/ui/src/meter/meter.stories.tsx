import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { roRO } from "../provider/locales/ro-RO.ts";

import { Meter } from "./meter.tsx";
import type { MeterProps } from "./meter.tsx";

// @ts-expect-error -- thresholds need a valueLabel that states the judgement in words
({ value: 92, label: "Storage", high: 90 }) satisfies MeterProps;

const meta = preview.meta({
  title: "Components/Feedback/Meter",
  component: Meter,
  args: { value: 42, label: "Storage" },
});

export const Default = meta.story({});

Default.test("is a meter named by its label, with its value", async ({ canvas }) => {
  const meter = canvas.getByRole("meter", { name: "Storage" });
  await expect(meter).toHaveAttribute("aria-valuenow", "42");
  await expect(meter).toHaveAttribute("aria-valuemin", "0");
  await expect(meter).toHaveAttribute("aria-valuemax", "100");
  await expect(canvas.getByText("42%")).toBeVisible();
});

Default.test(
  "reads a string valueLabel as its value text",
  {
    args: { value: 3, max: 5, label: undefined, "aria-label": "Rating", valueLabel: "3 out of 5" },
  },
  async ({ canvas }) => {
    const meter = canvas.getByRole("meter", { name: "Rating" });
    await expect(meter).toHaveAttribute("aria-valuetext", "3 out of 5");
    await expect(meter).toHaveAttribute("aria-valuemax", "5");
  },
);

Default.test(
  "states a threshold judgement in words",
  { args: { value: 92, low: 70, high: 90, optimum: 0, valueLabel: "92%, almost full" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("meter", { name: "Storage" })).toHaveAttribute(
      "aria-valuetext",
      "92%, almost full",
    );
    await expect(canvas.getByText("92%, almost full")).toBeVisible();
  },
);

Default.test(
  "shows a suboptimal value",
  { args: { value: 80, low: 70, high: 90, optimum: 0, valueLabel: "80%, filling up" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("80%, filling up")).toBeVisible();
  },
);

Default.test(
  "shows an optimal value",
  { args: { value: 30, low: 70, high: 90, optimum: 0, valueLabel: "30%, plenty of room" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("30%, plenty of room")).toBeVisible();
  },
);

Default.test(
  "clamps its value to the range",
  { args: { value: -5, min: 0, max: 10 } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("meter")).toHaveAttribute("aria-valuenow", "0");
    await expect(canvas.getByText("0%")).toBeVisible();
  },
);

Default.test(
  "formats the fraction of its range from min",
  { args: { value: 15, min: 10, max: 20 } },
  async ({ canvas }) => {
    await expect(canvas.getByText("50%")).toBeVisible();
  },
);

Default.test(
  "formats its value in the given locale",
  { args: { locale: roRO, label: "Spațiu" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("42 %")).toBeVisible();
  },
);
