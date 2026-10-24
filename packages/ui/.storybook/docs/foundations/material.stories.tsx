import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Material } from "./shape.tsx";
import { cellText, tokenRow } from "./table.ts";

const meta = preview.meta({ title: "Foundations/Material", tags: ["!autodocs"] });

export const Thickness = meta.story({ render: () => <Material /> });

Thickness.test(
  "shows each material with its reduced-transparency fill",
  async ({ canvasElement }) => {
    await expect(cellText(canvasElement, tokenRow("color-material-thin"), "Value")).toBe(
      "palette-sage-0-a56 light · palette-night-900-a56 dark(prefers-reduced-transparency: reduce): palette-sage-0 light · palette-night-900 dark",
    );
  },
);
