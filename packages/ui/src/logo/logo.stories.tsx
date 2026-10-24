import { expectSameDrawing } from "#.storybook/test/geometry.ts";
import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

import lichenSource from "../../assets/logo/stalpul-cerului-lichen.svg?raw";
import mossSource from "../../assets/logo/stalpul-cerului-moss.svg?raw";
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

Default.test("is hidden from assistive technology by default", async ({ canvasElement }) => {
  const svg = canvasElement.querySelector("svg");
  await expect(svg).toHaveAttribute("aria-hidden", "true");
  await expect(svg).not.toHaveAttribute("role");
});

Default.test("draws exactly the source Logo files", async ({ canvasElement }) => {
  const svg = canvasElement.querySelector("svg")!;
  await expectSameDrawing(svg, mossSource);
  await expectSameDrawing(svg, lichenSource);
});

Default.test("strokes in the Logo color at its source size", async ({ canvasElement }) => {
  const style = getComputedStyle(canvasElement.querySelector("svg")!);
  await expect([style.stroke, style.strokeWidth, style.inlineSize, style.minInlineSize]).toEqual([
    "rgb(38, 51, 22)",
    "3px",
    "32px",
    "16px",
  ]);
});

Default.test(
  "announces its label as an image",
  { args: { label: "Bereghici" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Bereghici" })).not.toHaveAttribute(
      "aria-hidden",
    );
  },
);

Default.test("follows the Theme", { globals: { theme: "dark" } }, async ({ canvasElement }) => {
  await expect(getComputedStyle(canvasElement.querySelector("svg")!).stroke).toBe(
    "rgb(236, 234, 201)",
  );
});

Default.test(
  "resizes through width and height, never below 16px",
  {
    render: (args) => (
      <>
        <Logo {...args} width={8} height={8} />
        <Logo {...args} width={48} height={48} />
      </>
    ),
  },
  async ({ canvasElement }) => {
    const sizes = [...canvasElement.querySelectorAll("svg")].map((svg) => {
      const { width, height } = svg.getBoundingClientRect();
      return [width, height];
    });
    await expect(sizes).toEqual([
      [16, 16],
      [48, 48],
    ]);
  },
);
