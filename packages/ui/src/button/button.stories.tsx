import preview from "#.storybook/preview.tsx";
import { expect, fn } from "storybook/test";

import { listen } from "#.storybook/test/listen.ts";
import { Button } from "./button.tsx";

const meta = preview.meta({
  title: "Components/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
});

export const Primary = meta.story({});

Primary.test("calls onClick when pressed", async ({ canvas, userEvent, args }) => {
  await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
  await expect(args.onClick).toHaveBeenCalledOnce();
});

Primary.test("dispatches a bubbling ab-press after a press", async ({ canvas, userEvent }) => {
  const button = canvas.getByRole("button", { name: "Save changes" });
  const presses = listen("ab-press");
  await userEvent.click(button);
  presses.stop();
  await expect(
    presses.events.map(({ target, bubbles, detail }) => ({ target, bubbles, detail })),
  ).toEqual([{ target: button, bubbles: true, detail: { component: "Button", reason: "user" } }]);
});

export const Disabled = meta.story({ args: { disabled: true } });

Disabled.test("stays focusable and blocks activation", async ({ canvas, userEvent, args }) => {
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
});

// Expected colours are the token source's literals (packages/tokens/src/tokens/*.tokens.json):
// light accent-bold = palette-moss-900 #263316, on-accent = palette-sage-0 #ffffff;
// dark accent-bold = palette-lichen-200 #eceac9, on-accent = palette-moss-900 #263316.
Primary.test("paints the primary Variant from its component tokens", async ({ canvas }) => {
  const style = getComputedStyle(canvas.getByRole("button", { name: "Save changes" }));
  await expect([style.backgroundColor, style.color]).toEqual([
    "rgb(38, 51, 22)",
    "rgb(255, 255, 255)",
  ]);
});

Primary.test("yields to unlayered app CSS", async ({ canvas }) => {
  // A type selector (0,0,1) beats the component's class (0,1,0) only because the component
  // styles sit in a cascade layer and this rule doesn't.
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

Primary.test("takes its component tokens from unlayered app CSS", async ({ canvas }) => {
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

export const DarkRightToLeft = meta.story({ globals: { theme: "dark", dir: "rtl" } });

DarkRightToLeft.test(
  "follows the Theme and direction set by toolbar globals",
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
