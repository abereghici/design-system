import preview from "#.storybook/preview.tsx";
import { expect, within } from "storybook/test";

import { Elevation } from "./shape.tsx";

const meta = preview.meta({ title: "Foundations/Elevation", tags: ["!autodocs"] });

export const Levels = meta.story({ render: () => <Elevation /> });

// The four Elevation levels and eight layers of the token source, lowest to highest.
Levels.test("lists the Elevation levels and layers in order", async ({ canvas }) => {
  const names = (caption: string) =>
    within(canvas.getByRole("table", { name: caption }))
      .getAllByRole("rowheader")
      .map((cell) => cell.textContent);
  await expect(names("Elevation")).toEqual([
    "--ab-elevation-raised",
    "--ab-elevation-overlay",
    "--ab-elevation-toast",
    "--ab-elevation-modal",
  ]);
  await expect(names("Layers")).toEqual(
    ["base", "raised", "sticky", "dropdown", "backdrop", "modal", "toast", "tooltip"].map(
      (layer) => `--ab-z-index-${layer}`,
    ),
  );
});
