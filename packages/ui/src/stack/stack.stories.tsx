import { expect } from "storybook/test";

import { Button } from "@abereghici/ui/button";

import preview from "#.storybook/preview.tsx";

import { Stack } from "./stack.tsx";

const meta = preview.meta({
  title: "Components/Stack",
  component: Stack,
  args: {
    children: (
      <>
        <Button>Profile</Button>
        <Button>Security</Button>
        <Button>Notifications</Button>
      </>
    ),
  },
});

export const Default = meta.story({});

Default.test("places each child below the one before", async ({ canvas }) => {
  const [first, second, third] = canvas
    .getAllByRole("button")
    .map((button) => button.getBoundingClientRect());

  await expect(second?.top).toBeGreaterThan(first?.bottom ?? Infinity);
  await expect(third?.top).toBeGreaterThan(second?.bottom ?? Infinity);
  // @ts-expect-error -- the gap is a stack space token, never a length
  void (<Stack gap="1rem" />);
});

Default.test(
  "lines its children up at the start of the line, the right in right-to-left",
  { args: { align: "start" }, globals: { dir: "rtl" } },
  async ({ canvas }) => {
    const [profile, security] = canvas
      .getAllByRole("button")
      .map((button) => button.getBoundingClientRect());

    await expect(security?.right).toBe(profile?.right);
    await expect(security?.left).not.toBe(profile?.left);
  },
);

Default.test(
  "spreads its children from its top to its bottom with space between",
  { args: { justify: "space-between", style: { blockSize: "20rem" } } },
  async ({ canvas, canvasElement }) => {
    const { top, bottom } = canvasElement.getBoundingClientRect();
    const [first, , last] = canvas
      .getAllByRole("button")
      .map((button) => button.getBoundingClientRect());

    await expect(first?.top).toBe(top);
    await expect(last?.bottom).toBe(bottom);
  },
);

Default.test(
  "renders as the list it is given, so its children stay list items",
  {
    args: {
      asChild: true,
      children: (
        <ul>
          <li>Profile</li>
          <li>Security</li>
        </ul>
      ),
    },
  },
  async ({ canvas }) => {
    const [first, second] = canvas
      .getAllByRole("listitem")
      .map((item) => item.getBoundingClientRect());

    await expect(canvas.getByRole("list")).toBeVisible();
    await expect(second?.top).toBeGreaterThan(first?.bottom ?? Infinity);
  },
);
