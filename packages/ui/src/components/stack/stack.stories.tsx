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
    await expect(canvas.getByRole("list")).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
);
