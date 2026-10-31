import { expect, fn } from "storybook/test";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { ToggleButton } from "./toggle-button.tsx";
import type { ToggleButtonChangeEventDetails } from "./toggle-button.tsx";

const meta = preview.meta({
  title: "Components/ToggleButton",
  component: ToggleButton,
  args: {
    value: "bold",
    children: "Bold",
    onPressedChange: fn<(pressed: boolean, details: ToggleButtonChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test(
  "turns on and off, reporting each change once",
  async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole("button", { name: "Bold" });
    const toggles = listen("ab-toggle");

    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(button);
    toggles.stop();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(args.onPressedChange).toHaveBeenCalledTimes(2);
    await expect(args.onPressedChange).toHaveBeenNthCalledWith(
      1,
      true,
      expect.objectContaining({ reason: "none" }),
    );
    await expect(args.onPressedChange).toHaveBeenNthCalledWith(2, false, expect.anything());
    await expect(toggles.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: button, detail: { component: "ToggleButton", reason: "user" } },
      { target: button, detail: { component: "ToggleButton", reason: "user" } },
    ]);
  },
);

Default.test(
  "stays as it was when the change is cancelled",
  {
    args: {
      onPressedChange: (_pressed, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Bold" });
    const toggles = listen("ab-toggle");

    await userEvent.click(button);
    toggles.stop();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "follows a controlled pressed",
  { args: { pressed: true } },
  async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole("button", { name: "Bold" });

    await userEvent.click(button);
    await expect(args.onPressedChange).toHaveBeenCalledWith(false, expect.anything());
    await expect(button).toHaveAttribute("aria-pressed", "true");
  },
);

Default.test(
  "blocks presses while disabled, and stays focusable and announced",
  { args: { disabled: true } },
  async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole("button", { name: "Bold" });

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
);
