import { expectSameDrawing } from "#.storybook/test/geometry.ts";
import preview from "#.storybook/preview.tsx";
import type { IconProps } from "@platform/ui/icon";
import type { ComponentType } from "react";
import { expect } from "storybook/test";

import { IconographyGuidelines } from "./brand.tsx";
import { cellText, tokenRow } from "./table.ts";

const modules = import.meta.glob<Record<string, ComponentType<IconProps>>>(
  "../../../src/icon/icons/*.tsx",
  { eager: true },
);
const sources = import.meta.glob<string>("../../../assets/icons/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});
const iconName = (path: string) => path.slice(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
const icons = Object.entries(modules)
  .map(([path, exports]) => ({ name: iconName(path), Component: Object.values(exports)[0]! }))
  .toSorted((a, b) => a.name.localeCompare(b.name));
const sourceText = new Map(Object.entries(sources).map(([path, text]) => [iconName(path), text]));

const meta = preview.meta({ title: "Foundations/Iconography", tags: ["!autodocs"] });

export const Guidelines = meta.story({ render: () => <IconographyGuidelines /> });

Guidelines.test("lists the icon sizes and strokes", async ({ canvas }) => {
  const table = canvas.getByRole("table", { name: "Icon tokens" });
  const value = (name: string) => cellText(table, tokenRow(name), "Value");
  await expect([
    value("icon-md-size"),
    value("icon-md-stroke-width"),
    value("size-icon-md"),
    value("stroke-width-md"),
  ]).toEqual(["size-icon-md", "stroke-width-md", "dimension-20", "stroke-width-175"]);
});

export const Icons = meta.story({
  render: () => (
    <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 7rem)", gap: "1rem" }}>
      {icons.map(({ name, Component }) => (
        <li key={name} data-icon={name} style={{ display: "grid", justifyItems: "center" }}>
          <Component />
          <code>{name}</code>
        </li>
      ))}
    </ul>
  ),
});

Icons.test("has one icon for every source SVG", async ({ canvasElement }) => {
  const shown = [...canvasElement.querySelectorAll("li")].map((item) => item.dataset["icon"]);
  await expect(shown).toEqual([...sourceText.keys()].toSorted((a, b) => a.localeCompare(b)));
});

Icons.test("draws every source icon exactly", async ({ canvasElement }) => {
  for (const item of canvasElement.querySelectorAll("li")) {
    await expectSameDrawing(item.querySelector("svg")!, sourceText.get(item.dataset["icon"]!)!);
  }
});

Icons.test("hides every icon from assistive technology", async ({ canvasElement }) => {
  const svgs = [...canvasElement.querySelectorAll("svg")];
  await expect(svgs.filter((svg) => svg.getAttribute("aria-hidden") !== "true")).toEqual([]);
});
