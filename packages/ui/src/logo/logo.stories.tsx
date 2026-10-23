import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import lichenSource from "../../assets/logo/stalpul-cerului-lichen.svg?raw";
import mossSource from "../../assets/logo/stalpul-cerului-moss.svg?raw";
import { expectSameDrawing } from "../testing/geometry.ts";
import { Logo } from "./logo.tsx";

const meta = preview.meta({ title: "Components/Logo", component: Logo });

export const Decorative = meta.story({});

Decorative.test("is hidden from assistive technology by default", async ({ canvasElement }) => {
  const svg = canvasElement.querySelector("svg");
  await expect(svg).toHaveAttribute("aria-hidden", "true");
  await expect(svg).not.toHaveAttribute("role");
});

Decorative.test("draws exactly the source Logo files", async ({ canvasElement }) => {
  const svg = canvasElement.querySelector("svg")!;
  await expectSameDrawing(svg, mossSource);
  await expectSameDrawing(svg, lichenSource);
});

// Expected values are the token source's literals: logo-color = color-icon-accent =
// palette-moss-900 #263316 (light) / palette-lichen-200 #eceac9 (dark); logo-stroke-width =
// stroke-width-2xl = 3; logo-min-size = size-mark-min = 16px; 32 is the source file's size.
Decorative.test("strokes in the Logo color at its source size", async ({ canvasElement }) => {
  const style = getComputedStyle(canvasElement.querySelector("svg")!);
  await expect([style.stroke, style.strokeWidth, style.inlineSize, style.minInlineSize]).toEqual([
    "rgb(38, 51, 22)",
    "3px",
    "32px",
    "16px",
  ]);
});

export const Labelled = meta.story({ args: { label: "Bereghici" } });

Labelled.test("announces its label as an image", async ({ canvas }) => {
  await expect(canvas.getByRole("img", { name: "Bereghici" })).not.toHaveAttribute("aria-hidden");
});

export const Dark = meta.story({ globals: { theme: "dark" } });

Dark.test("follows the Theme", async ({ canvasElement }) => {
  await expect(getComputedStyle(canvasElement.querySelector("svg")!).stroke).toBe(
    "rgb(236, 234, 201)",
  );
});

export const Sizes = meta.story({
  render: (args) => (
    <>
      <Logo {...args} width={8} height={8} />
      <Logo {...args} width={48} height={48} />
    </>
  ),
});

Sizes.test("resizes through width and height, never below 16px", async ({ canvasElement }) => {
  const sizes = [...canvasElement.querySelectorAll("svg")].map((svg) => {
    const { width, height } = svg.getBoundingClientRect();
    return [width, height];
  });
  await expect(sizes).toEqual([
    [16, 16],
    [48, 48],
  ]);
});
