import { listen } from "#.storybook/test/listen.ts";
import preview from "#.storybook/preview.tsx";
import { expect, fn } from "storybook/test";

import { Button } from "./button.tsx";

const meta = preview.meta({
  title: "Components/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'A native `<button type="button">` for an action. Every press dispatches a bubbling `ab-press` event after `onClick`. For an action that navigates, use a link.',
      },
    },
  },
});

export const Default = meta.story({});

Default.test("calls onClick when pressed", async ({ canvas, userEvent, args }) => {
  await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
  await expect(args.onClick).toHaveBeenCalledOnce();
});

Default.test("dispatches a bubbling ab-press after a press", async ({ canvas, userEvent }) => {
  const button = canvas.getByRole("button", { name: "Save changes" });
  const presses = listen("ab-press");
  await userEvent.click(button);
  presses.stop();
  await expect(
    presses.events.map(({ target, bubbles, detail }) => ({ target, bubbles, detail })),
  ).toEqual([{ target: button, bubbles: true, detail: { component: "Button", reason: "user" } }]);
});

Default.test(
  "stays focusable and blocks activation when disabled",
  { args: { disabled: true } },
  async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole("button", { name: "Save changes" });
    await expect(button).toHaveAttribute("aria-disabled", "true");
    const presses = listen("ab-press");
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await userEvent.click(button);
    presses.stop();
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(presses.events).toEqual([]);
  },
);

Default.test("paints the primary Variant from its component tokens", async ({ canvas }) => {
  const style = getComputedStyle(canvas.getByRole("button", { name: "Save changes" }));
  await expect([style.backgroundColor, style.color]).toEqual([
    "rgb(38, 51, 22)",
    "rgb(255, 255, 255)",
  ]);
});

Default.test("yields to unlayered app CSS", async ({ canvas }) => {
  const appStyles = document.createElement("style");
  appStyles.textContent = "button { background-color: rgb(1, 2, 3); }";
  document.head.append(appStyles);
  try {
    const style = getComputedStyle(canvas.getByRole("button", { name: "Save changes" }));
    await expect(style.backgroundColor).toBe("rgb(1, 2, 3)");
  } finally {
    appStyles.remove();
  }
});

Default.test("takes its component tokens from unlayered app CSS", async ({ canvas }) => {
  const appStyles = document.createElement("style");
  appStyles.textContent = ":root { --ab-button-primary-background-color: rgb(1, 2, 3); }";
  document.head.prepend(appStyles);
  try {
    const style = getComputedStyle(canvas.getByRole("button", { name: "Save changes" }));
    await expect(style.backgroundColor).toBe("rgb(1, 2, 3)");
  } finally {
    appStyles.remove();
  }
});

Default.test(
  "follows the Theme and direction set by toolbar globals",
  { globals: { theme: "dark", dir: "rtl" } },
  async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Save changes" });
    const style = getComputedStyle(button);
    await expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await expect(button.matches(":dir(rtl)")).toBe(true);
    await expect([style.backgroundColor, style.color]).toEqual([
      "rgb(236, 234, 201)",
      "rgb(38, 51, 22)",
    ]);
  },
);
