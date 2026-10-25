import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Spinner } from "./spinner.tsx";
import type { SpinnerProps } from "./spinner.tsx";

// @ts-expect-error -- a status needs its message
({}) satisfies SpinnerProps;
// @ts-expect-error -- a decorative Spinner says nothing
({ "aria-hidden": true, children: "Loading" }) satisfies SpinnerProps;

const meta = preview.meta({
  title: "Components/Spinner",
  component: Spinner,
  args: { children: "Loading" },
});

export const Default = meta.story({});

Default.test("is a status that says its message", async ({ canvas }) => {
  await expect(canvas.getByRole("status")).toHaveTextContent("Loading");
});

Default.test(
  "is hidden from assistive technology when decorative",
  { args: { "aria-hidden": true, children: undefined } },
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
