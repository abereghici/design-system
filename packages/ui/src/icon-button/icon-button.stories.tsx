import { useState } from "react";
import type { ComponentProps, MouseEvent } from "react";
import { expect, fn } from "storybook/test";

import type { StoryContext } from "@storybook/react-vite";

import { PinIcon } from "@abereghici/ui/icons/pin";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { IconButton } from "./icon-button.tsx";
import type { IconButtonChangeEventDetails, IconButtonProps } from "./icon-button.tsx";

type Context = StoryContext<ComponentProps<typeof IconButton>>;

async function blocksActivation({ canvas, userEvent, args }: Context) {
  const button = canvas.getByRole("button", { name: "Pin" });
  const feedback = [listen("ab-press"), listen("ab-toggle")];

  await userEvent.tab();
  await expect(button).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  await userEvent.click(button);

  for (const { stop } of feedback) stop();

  await expect(args.onClick).not.toHaveBeenCalled();
  await expect(args.onPressedChange).not.toHaveBeenCalled();
  await expect(feedback.flatMap(({ events }): Event[] => events)).toEqual([]);
}

// @ts-expect-error -- an IconButton without aria-label or aria-labelledby has no accessible name
void (<IconButton />);

function ControlledIconButton(props: IconButtonProps) {
  const [pressed, setPressed] = useState(props.pressed ?? false);

  return (
    <IconButton
      {...props}
      pressed={pressed}
      onPressedChange={(next, details) => {
        props.onPressedChange?.(next, details);
        setPressed(next);
      }}
    />
  );
}

const meta = preview.meta({
  title: "Components/IconButton",
  component: IconButton,
  args: {
    "aria-label": "Pin",
    children: <PinIcon />,
    onClick: fn(),
    onPressedChange: fn(),
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
    { target: button, bubbles: true, detail: { component: "IconButton", reason: "user" } },
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
  { args: { disabled: true, defaultPressed: false } },
  blocksActivation,
);

Default.test(
  "stays focusable and blocks activation when loading",
  { args: { loading: true, defaultPressed: false } },
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
  "toggles with a press, Enter and Space, keeping its name",
  { args: { defaultPressed: false } },
  async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole("button", { name: "Pin" });

    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Enter}");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("button", { name: "Pin", pressed: true })).toHaveFocus();
    await expect(args.onPressedChange).toHaveBeenNthCalledWith(
      1,
      true,
      expect.objectContaining({ reason: "none" }),
    );
    await expect(args.onPressedChange).toHaveBeenNthCalledWith(2, false, expect.anything());
  },
);

Default.test(
  "dispatches ab-toggle, not ab-press, when it toggles",
  { args: { defaultPressed: true } },
  async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Pin" });
    const toggles = listen("ab-toggle");
    const presses = listen("ab-press");

    await userEvent.click(button);
    toggles.stop();
    presses.stop();
    await expect(presses.events).toEqual([]);
    await expect(toggles.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: button, detail: { component: "IconButton", reason: "user" } },
    ]);
  },
);

Default.test(
  "keeps its state when the change is cancelled",
  {
    args: {
      defaultPressed: false,
      onPressedChange: fn((_pressed: boolean, details: IconButtonChangeEventDetails) => {
        details.cancel();
      }),
    },
  },
  async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Pin" });
    const toggles = listen("ab-toggle");

    await userEvent.click(button);
    toggles.stop();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "keeps a controlled state until the parent changes it",
  { args: { pressed: true } },
  async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole("button", { name: "Pin" });

    await userEvent.click(button);
    await expect(args.onPressedChange).toHaveBeenCalledWith(false, expect.anything());
    await expect(button).toHaveAttribute("aria-pressed", "true");
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

export const Controlled = meta.story({
  args: { pressed: true },
  render: ControlledIconButton,
  parameters: {
    docs: { description: { story: "The parent holds `pressed` and updates it on change." } },
  },
});

Controlled.test("follows the parent's state", async ({ canvas, userEvent, args }) => {
  const button = canvas.getByRole("button", { name: "Pin", pressed: true });

  await userEvent.click(button);
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(args.onPressedChange).toHaveBeenCalledWith(false, expect.anything());
});
