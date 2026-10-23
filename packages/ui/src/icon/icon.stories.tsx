import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import { SearchIcon } from "../icons/search.tsx";
import { Icon } from "./icon.tsx";

const meta = preview.meta({
  title: "Components/Icon",
  component: Icon,
  // A custom glyph on the 24-unit grid. The generated icons (`@platform/ui/icons/*`) wrap Icon
  // the same way.
  args: { children: <path d="M5 12h14" /> },
});

export const Decorative = meta.story({});

Decorative.test("is hidden from assistive technology by default", async ({ canvasElement }) => {
  const svg = canvasElement.querySelector("svg");
  await expect(svg).toHaveAttribute("aria-hidden", "true");
  await expect(svg).not.toHaveAttribute("role");
});

export const Labelled = meta.story({ args: { label: "Remove" } });

Labelled.test("announces its label as an image", async ({ canvas }) => {
  const svg = canvas.getByRole("img", { name: "Remove" });
  await expect(svg).not.toHaveAttribute("aria-hidden");
});

// Expected values are the token source's literals (packages/tokens/src/tokens/*.tokens.json):
// size-icon-sm|md|lg|xl = dimension-16|20|24|32; icon-sm|md|lg|xl-stroke-width =
// stroke-width-lg|md|md|sm = 2|1.75|1.75|1.5 ("stroke thins as size grows", Icon guide).
export const Sizes = meta.story({
  render: (args) => (
    <>
      <Icon {...args} size="sm" />
      <Icon {...args} />
      <Icon {...args} size="lg" />
      <Icon {...args} size="xl" />
    </>
  ),
});

Sizes.test("takes each size and stroke from the icon tokens, md by default", async (context) => {
  const icons = [...context.canvasElement.querySelectorAll("svg")].map((svg) => {
    const style = getComputedStyle(svg);
    return [style.inlineSize, style.blockSize, style.strokeWidth];
  });
  await expect(icons).toEqual([
    ["16px", "16px", "2px"],
    ["20px", "20px", "1.75px"],
    ["24px", "24px", "1.75px"],
    ["32px", "32px", "1.5px"],
  ]);
});

export const InheritsColor = meta.story({
  render: (args) => (
    <span className="host" style={{ color: "rgb(1, 2, 3)" }}>
      <SearchIcon {...args} />
    </span>
  ),
});

InheritsColor.test("draws in the surrounding text colour", async ({ canvasElement }) => {
  const style = getComputedStyle(canvasElement.querySelector("svg")!);
  await expect([style.stroke, style.color]).toEqual(["rgb(1, 2, 3)", "rgb(1, 2, 3)"]);
});

InheritsColor.test("yields its size to a host component's rule", async ({ canvasElement }) => {
  // How a host (IconButton) sizes icons a consumer passes in: a descendant rule in
  // `ab.components` (0,1,1) beats Icon's own size rules (0,1,0).
  const host = document.createElement("style");
  host.textContent =
    "@layer ab.components { .host svg { inline-size: 12px; block-size: 12px; stroke-width: 3; } }";
  document.head.append(host);
  try {
    const style = getComputedStyle(canvasElement.querySelector("svg")!);
    await expect([style.inlineSize, style.blockSize, style.strokeWidth]).toEqual([
      "12px",
      "12px",
      "3px",
    ]);
  } finally {
    host.remove();
  }
});
