import { expect, fn } from "storybook/test";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { Switch } from "./switch.tsx";
import type { SwitchChangeEventDetails } from "./switch.tsx";

const meta = preview.meta({
  title: "Components/Forms/Switch",
  component: Switch,
  args: {
    children: "Sound",
    onCheckedChange: fn<(checked: boolean, details: SwitchChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test("turns on when its label is clicked", async ({ canvas, userEvent, args }) => {
  const control = canvas.getByRole("switch", { name: "Sound" });
  await userEvent.click(canvas.getByText("Sound"));
  await expect(control).toBeChecked();
  await expect(args.onCheckedChange).toHaveBeenCalledOnce();
  await expect(args.onCheckedChange).toHaveBeenCalledWith(
    true,
    expect.objectContaining({ reason: "none" }),
  );
});

Default.test("toggles with Space and keeps its name", async ({ canvas, userEvent }) => {
  const control = canvas.getByRole("switch", { name: "Sound" });
  await userEvent.tab();
  await expect(control).toHaveFocus();
  await userEvent.keyboard(" ");
  await expect(canvas.getByRole("switch", { name: "Sound" })).toBeChecked();
  await userEvent.keyboard(" ");
  await expect(control).not.toBeChecked();
});

Default.test("dispatches a bubbling ab-toggle after a change", async ({ canvas, userEvent }) => {
  const control = canvas.getByRole("switch", { name: "Sound" });
  const toggles = listen("ab-toggle");
  await userEvent.click(control);
  toggles.stop();
  await expect(
    toggles.events.map(({ target, bubbles, detail }) => ({ target, bubbles, detail })),
  ).toEqual([{ target: control, bubbles: true, detail: { component: "Switch", reason: "user" } }]);
});

Default.test(
  "keeps its state when the change is cancelled",
  {
    args: {
      defaultChecked: true,
      onCheckedChange: (_checked, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const control = canvas.getByRole("switch", { name: "Sound" });
    const toggles = listen("ab-toggle");
    await userEvent.click(control);
    toggles.stop();
    await expect(control).toBeChecked();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "follows a controlled checked value",
  { args: { checked: false } },
  async ({ canvas, userEvent, args }) => {
    const control = canvas.getByRole("switch", { name: "Sound" });
    await userEvent.click(control);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    await expect(control).not.toBeChecked();
  },
);

Default.test(
  "stays focusable and blocks the change when disabled",
  { args: { disabled: true } },
  async ({ canvas, userEvent, args }) => {
    const control = canvas.getByRole("switch", { name: "Sound" });
    await expect(control).toHaveAttribute("aria-disabled", "true");
    const toggles = listen("ab-toggle");
    await userEvent.tab();
    await expect(control).toHaveFocus();
    await userEvent.keyboard(" ");
    await userEvent.click(canvas.getByText("Sound"));
    toggles.stop();
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
    await expect(toggles.events).toEqual([]);
  },
);
