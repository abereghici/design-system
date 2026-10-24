import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

import { Icon } from "./icon.tsx";

const meta = preview.meta({
  title: "Components/Icon",
  component: Icon,
  args: { children: <path d="M5 12h14" /> },
  parameters: {
    docs: {
      description: {
        component:
          "A glyph on the 24-unit icon grid, stroked in `currentColor`. The generated icons (`@platform/ui/icons/<name>`) render through it; pass your own `<path>` children for a custom glyph. For the brand mark, use Logo.",
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

Default.test(
  "announces its label as an image",
  { args: { label: "Remove" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Remove" })).not.toHaveAttribute("aria-hidden");
  },
);

Default.test(
  "takes each size and stroke from the icon tokens, md by default",
  {
    render: (args) => (
      <>
        <Icon {...args} size="sm" />
        <Icon {...args} />
        <Icon {...args} size="lg" />
        <Icon {...args} size="xl" />
      </>
    ),
  },
  async ({ canvasElement }) => {
    const icons = [...canvasElement.querySelectorAll("svg")].map((svg) => {
      const style = getComputedStyle(svg);
      return [style.inlineSize, style.blockSize, style.strokeWidth];
    });
    await expect(icons).toEqual([
      ["16px", "16px", "2px"],
      ["20px", "20px", "1.75px"],
      ["24px", "24px", "1.75px"],
      ["32px", "32px", "1.5px"],
    ]);
  },
);

export const InheritsColor = meta.story({
  decorators: [
    (Story) => (
      <span className="host" style={{ color: "rgb(1, 2, 3)" }}>
        <Story />
      </span>
    ),
  ],
  parameters: {
    docs: {
      description: { story: "An icon draws in the text colour of whatever it sits in." },
    },
  },
});

InheritsColor.test("draws in the surrounding text colour", async ({ canvasElement }) => {
  const style = getComputedStyle(canvasElement.querySelector("svg")!);
  await expect([style.stroke, style.color]).toEqual(["rgb(1, 2, 3)", "rgb(1, 2, 3)"]);
});

InheritsColor.test("yields its size to a host component's rule", async ({ canvasElement }) => {
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
