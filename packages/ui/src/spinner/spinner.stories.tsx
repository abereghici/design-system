import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import type { Locale } from "../provider/locale.tsx";
import { roRO } from "../provider/locales/ro-RO.ts";

import { Spinner } from "./spinner.tsx";

// @ts-expect-error -- a locale must translate every built-in label
({ tag: "fr-FR", labels: {} }) satisfies Locale;

const meta = preview.meta({
  title: "Components/Feedback/Spinner",
  component: Spinner,
});

export const Default = meta.story({});

Default.test("is a status named Loading", async ({ canvas }) => {
  await expect(canvas.getByRole("status", { name: "Loading" })).toBeVisible();
});

Default.test(
  "takes its name from aria-label",
  { args: { size: "lg", "aria-label": "Loading results" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("status", { name: "Loading results" })).toBeVisible();
  },
);

Default.test(
  "takes its name from a locale's labels",
  { args: { labels: roRO.labels.spinner } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("status", { name: "Se încarcă" })).toBeVisible();
  },
);

Default.test(
  "is hidden from assistive technology when decorative",
  { args: { "aria-hidden": true } },
  async ({ canvas }) => {
    await expect(canvas.queryByRole("status", { hidden: true })).toBeNull();
  },
);

Default.test("turns only when motion is allowed", async ({ canvas }) => {
  const turning = canvas
    .getByRole("status")
    .getAnimations({ subtree: true })
    .some(
      ({ effect }) =>
        effect instanceof KeyframeEffect &&
        effect.getKeyframes().some((frame) => "rotate" in frame),
    );
  await expect(turning).toBe(!matchMedia("(prefers-reduced-motion: reduce)").matches);
});
