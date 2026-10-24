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

Default.test("is hidden from assistive technology by default", async ({ canvas }) => {
  await expect(canvas.queryByRole("img")).toBeNull();
});

Default.test(
  "announces its label as an image",
  { args: { label: "Remove" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Remove" })).toBeVisible();
  },
);

export const InheritsColor = meta.story({
  decorators: [
    (Story) => (
      <span style={{ color: "rgb(1, 2, 3)" }}>
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
