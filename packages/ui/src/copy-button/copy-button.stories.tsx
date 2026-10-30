import { expect, fn } from "storybook/test";

import preview from "#.storybook/preview.tsx";
import { trusted } from "#.storybook/test/trusted.ts";

import { CopyButton } from "./copy-button.tsx";

const meta = preview.meta({
  title: "Components/CopyButton",
  component: CopyButton,
  args: {
    value: "INV-2026-0042",
    copiedLabel: "Copied",
    failedLabel: "Copying failed",
    children: "Copy invoice number",
    onClick: fn(),
  },
});

export const Default = meta.story({});

Default.test("copies its text and says so", async ({ canvas, args }) => {
  const user = await trusted();

  const copy = canvas.getByRole("button", { name: "Copy invoice number" });

  await user.click(copy);
  await expect(canvas.getByRole("status")).toHaveTextContent("Copied");
  await expect(args.onClick).toHaveBeenCalledOnce();
  // The clipboard answers only a focused document, which the press above made this one.
  await navigator.clipboard.writeText("something else");
  await user.click(copy);
  await expect(await navigator.clipboard.readText()).toBe("INV-2026-0042");
});

Default.test("says so when copying fails", async ({ canvas, userEvent }) => {
  const clipboard = navigator.clipboard.writeText.bind(navigator.clipboard);

  navigator.clipboard.writeText = () => Promise.reject(new Error("denied"));

  try {
    await userEvent.click(canvas.getByRole("button", { name: "Copy invoice number" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Copying failed");
  } finally {
    navigator.clipboard.writeText = clipboard;
  }
});
