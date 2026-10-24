import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

import { Motion } from "./motion.tsx";
import { cellText, tokenRow } from "./table.ts";

const meta = preview.meta({ title: "Foundations/Motion", tags: ["!autodocs"] });

// Static curves and tables only, so screenshots are deterministic.
export const Tokens = meta.story({ render: () => <Motion /> });

// The nine motion-easing tokens of the token source.
Tokens.test("plots every easing", async ({ canvas }) => {
  await expect(
    canvas.getAllByRole("img", { name: /curve$/v }).map((plot) => plot.getAttribute("aria-label")),
  ).toEqual(
    [
      "enter",
      "exit",
      "move",
      "drawer",
      "color",
      "constant",
      "spring",
      "spring-gentle",
      "spring-bouncy",
    ].map((use) => `motion-easing-${use} curve`),
  );
});

// motion-scale-pressed is scale-97, and scale-100 under reduced motion.
Tokens.test("shows the reduced-motion value of each movement", async ({ canvas }) => {
  const table = canvas.getByRole("table", { name: "Scale, distance and blur" });
  await expect(cellText(table, tokenRow("motion-scale-pressed"), "Value")).toBe(
    "scale-97(prefers-reduced-motion: reduce): scale-100",
  );
});

// easing-spring-snappy ends at .9985 at 100% (packages/tokens/src/tokens/primitive.tokens.json),
// and a cubic Bézier ends at (1, 1): both plots end on the 1.0 guide line, at y = 20.
Tokens.test("ends each curve at its final value", async ({ canvas }) => {
  const end = (name: string) =>
    canvas
      .getByRole("img", { name: `${name} curve` })
      .querySelector("path:last-of-type")
      ?.getAttribute("d")
      ?.split(" ")
      .at(-1);
  await expect([end("motion-easing-enter"), end("motion-easing-spring")]).toEqual([
    "L100.00,20.00",
    "L100.00,20.15",
  ]);
});
