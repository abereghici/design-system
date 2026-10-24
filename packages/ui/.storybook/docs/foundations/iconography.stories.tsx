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
const sources = import.meta.glob("../../../assets/icons/*.svg");
const iconName = (path: string) => path.slice(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
const icons = Object.entries(modules)
  .map(([path, exports]) => ({ name: iconName(path), Component: Object.values(exports)[0]! }))
  .toSorted((a, b) => a.name.localeCompare(b.name));
const sourceNames = Object.keys(sources).map((path) => iconName(path));

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
        <li key={name} style={{ display: "grid", justifyItems: "center" }}>
          <Component />
          <code>{name}</code>
        </li>
      ))}
    </ul>
  ),
});

Icons.test("has one icon for every source SVG", async ({ canvas }) => {
  const shown = canvas.getAllByRole("listitem").map((item) => item.textContent);
  await expect(shown).toEqual([...sourceNames].toSorted((a, b) => a.localeCompare(b)));
});

Icons.test("hides every icon from assistive technology", async ({ canvas }) => {
  await expect(canvas.queryAllByRole("img")).toEqual([]);
});
