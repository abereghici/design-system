import type { ComponentProps, MouseEvent } from "react";
import { expect, fn } from "storybook/test";

import type { StoryContext } from "@storybook/react-vite";

import { PinIcon } from "@abereghici/ui/icons/pin";

import { withRow } from "#.storybook/decorators/with-row.tsx";
import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { onTouchScreen, pressJustBelow } from "#.storybook/test/pointer.ts";

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

Default.test(
  "on a touch screen, takes a press just outside its edge",
  { beforeEach: onTouchScreen },
  async ({ canvas, args }) => {
    const button = canvas.getByRole("button");

    await pressJustBelow(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
);

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

Default.test("is announced as disabled", { args: { disabled: true } }, async ({ canvas }) => {
  await expect(canvas.getByRole("button", { name: "Pin" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});

Default.test(
  "is announced as busy and unavailable while loading",
  { args: { loading: true } },
  async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Pin" });

    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toHaveAttribute("aria-disabled", "true");
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

const disabledChildClick = fn<(event: MouseEvent) => void>();

Default.test(
  "ignores presses on its child's own click handler while disabled with asChild",
  {
    args: {
      asChild: true,
      disabled: true,
      "aria-label": "Settings",
      children: (
        <a href="#settings" onClick={disabledChildClick}>
          <PinIcon />
        </a>
      ),
    },
  },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Settings" }));
    await expect(disabledChildClick).not.toHaveBeenCalled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
);

export const WorstCase = meta.story({
  tags: ["!autodocs"],
  decorators: [withRow],
  render: (args) => (
    <>
      <IconButton
        {...args}
        size="sm"
        aria-label="Épingler la facture INV-2026-0042 pour toute l’équipe"
      />
      <IconButton {...args} loading />
      <IconButton {...args} size="lg" disabled />
      <IconButton asChild aria-label="Ouvrir la facture">
        <a href="#invoice">
          <PinIcon />
        </a>
      </IconButton>
    </>
  ),
});
