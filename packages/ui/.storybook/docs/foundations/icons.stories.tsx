import preview from "#.storybook/preview.tsx";
import type { ComponentType } from "react";
import { expect } from "storybook/test";

import type { IconProps } from "@platform/ui/icon";
import { expectSameDrawing } from "#.storybook/test/geometry.ts";

// Every generated icon module and every source SVG, keyed by icon name.
const modules = import.meta.glob<Record<string, ComponentType<IconProps>>>("../../../src/icons/*.tsx", {
  eager: true,
});
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

function Gallery(props: IconProps) {
  return (
    <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 7rem)", gap: "1rem" }}>
      {icons.map(({ name, Component }) => (
        <li key={name} data-icon={name} style={{ display: "grid", justifyItems: "center" }}>
          <Component {...props} />
          <code>{name}</code>
        </li>
      ))}
    </ul>
  );
}

const meta = preview.meta({
  title: "Foundations/Icons",
  component: Gallery,
  parameters: { layout: "padded" },
});

export const AllIcons = meta.story({});

AllIcons.test("has one icon for every source SVG", async ({ canvasElement }) => {
  const shown = [...canvasElement.querySelectorAll("li")].map((item) => item.dataset["icon"]);
  await expect(shown).toEqual([...sourceText.keys()].toSorted((a, b) => a.localeCompare(b)));
});

AllIcons.test("draws every source icon exactly", async ({ canvasElement }) => {
  for (const item of canvasElement.querySelectorAll("li")) {
    const name = item.dataset["icon"]!;
    await expectSameDrawing(item.querySelector("svg")!, sourceText.get(name)!);
  }
});

AllIcons.test("hides every icon from assistive technology", async ({ canvasElement }) => {
  const svgs = [...canvasElement.querySelectorAll("svg")];
  await expect(svgs.filter((svg) => svg.getAttribute("aria-hidden") !== "true")).toEqual([]);
});

export const Large = meta.story({ args: { size: "xl" } });

export const DarkRightToLeft = meta.story({ globals: { theme: "dark", dir: "rtl" } });
