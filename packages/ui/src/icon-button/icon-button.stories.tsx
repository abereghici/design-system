import type { ComponentProps, MouseEvent } from "react";
import { expect, fn } from "storybook/test";

import type { StoryContext } from "@storybook/react-vite";

import { PinIcon } from "@abereghici/ui/icons/pin";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { IconButton } from "./icon-button.tsx";

type Context = StoryContext<ComponentProps<typeof IconButton>>;

async function blocksActivation({ canvas, userEvent, args }: Context) {
  const button = canvas.getByRole("button", { name: "Pin" });
  const presses = listen("ab-press");

  await userEvent.tab();
  await expect(button).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  await userEvent.click(button);

  presses.stop();
  await expect(args.onClick).not.toHaveBeenCalled();
  await expect(presses.events).toEqual([]);
}

const meta = preview.meta({
  title: "Components/IconButton",
  component: IconButton,
  args: {
    "aria-label": "Pin",
    children: <PinIcon />,
    onClick: fn(),
  },
});

export const Default = meta.story({});

Default.test("is a plain button that reports a press", async ({ canvas, userEvent, args }) => {
  const button = canvas.getByRole("button", { name: "Pin" });

  await expect(button).not.toHaveAttribute("aria-pressed");
  await userEvent.click(button);
  await expect(args.onClick).toHaveBeenCalledOnce();
});

Default.test("dispatches a bubbling ab-press after a press", async ({ canvas, userEvent }) => {
  const button = canvas.getByRole("button", { name: "Pin" });
  const presses = listen("ab-press");

  await userEvent.click(button);
  presses.stop();
  await expect(
    presses.events.map(({ target, bubbles, detail }) => ({ target, bubbles, detail })),
  ).toEqual([
    { target: button, bubbles: true, detail: { component: "IconButton", userInitiated: true } },
  ]);
});

Default.test(
  "is named by aria-labelledby",
  {
    args: { "aria-labelledby": "pin-label" },
    decorators: [
      (Story) => (
        <>
          <span id="pin-label">Pin to top</span>
          <Story />
        </>
      ),
    ],
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Pin to top" })).toBeVisible();
  },
);

Default.test(
  "passes the accessibility checks at the sm size",
  { args: { size: "sm" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Pin" })).toBeVisible();
  },
);

Default.test(
  "stays focusable and blocks activation when disabled",
  { args: { disabled: true } },
  blocksActivation,
);

Default.test(
  "stays focusable and blocks activation when loading",
  { args: { loading: true } },
  blocksActivation,
);

Default.test(
  "is announced as disabled or busy",
  { args: { disabled: true, loading: true } },
  async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Pin" });

    await expect(button).toHaveAttribute("aria-disabled", "true");
    await expect(button).toHaveAttribute("aria-busy", "true");
  },
);

Default.test(
  "renders its child with asChild",
  {
    args: {
      asChild: true,
      "aria-label": "Settings",
      children: (
        <a href="#settings">
          <PinIcon />
        </a>
      ),
      onClick: fn((event: MouseEvent) => {
        event.preventDefault();
      }),
    },
  },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Settings" }));
    await expect(canvas.queryByRole("button")).toBeNull();
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
);
