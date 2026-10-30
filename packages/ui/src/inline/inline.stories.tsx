import { expect } from "storybook/test";

import { Button } from "@abereghici/ui/button";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview from "#.storybook/preview.tsx";

import { Inline } from "./inline.tsx";

const meta = preview.meta({
  title: "Components/Inline",
  component: Inline,
  args: {
    children: (
      <>
        <Button variant="primary">Publish</Button>
        <Button>Save draft</Button>
        <Button variant="tertiary">Discard</Button>
      </>
    ),
  },
});

export const Default = meta.story({});

Default.test(
  "places its children side by side, from the right in right-to-left",
  { globals: { dir: "rtl" } },
  async ({ canvas }) => {
    const [publish, save] = canvas
      .getAllByRole("button")
      .map((button) => button.getBoundingClientRect());

    await expect(save?.right).toBeLessThan(publish?.left ?? -Infinity);
    await expect(save?.top).toBe(publish?.top);
    // @ts-expect-error -- the gap is an inline space token, never a length
    void (<Inline gap="8px" />);
  },
);

Default.test(
  "wraps its children onto the next line when they don't fit",
  { decorators: [withWidth("10rem")] },
  async ({ canvas }) => {
    const [publish, , discard] = canvas
      .getAllByRole("button")
      .map((button) => button.getBoundingClientRect());

    await expect(discard?.top).toBeGreaterThan(publish?.bottom ?? Infinity);
  },
);

Default.test(
  "puts its children at the end of the line, the left in right-to-left",
  { args: { justify: "end" }, globals: { dir: "rtl" } },
  async ({ canvas, canvasElement }) => {
    const discard = canvas.getByRole("button", { name: "Discard" }).getBoundingClientRect();

    await expect(discard.left).toBe(canvasElement.getBoundingClientRect().left);
  },
);

Default.test(
  "lines children of different heights up along their bottom edge",
  {
    args: {
      align: "end",
      children: (
        <>
          <Button size="lg">Publish</Button>
          <Button size="sm">Discard</Button>
        </>
      ),
    },
  },
  async ({ canvas }) => {
    const [publish, discard] = canvas
      .getAllByRole("button")
      .map((button) => button.getBoundingClientRect());

    await expect(discard?.bottom).toBe(publish?.bottom);
    await expect(discard?.top).not.toBe(publish?.top);
  },
);
