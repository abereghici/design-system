import type { MouseEvent } from "react";
import { expect, fn } from "storybook/test";

import type { StoryContext } from "@storybook/react-vite";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import * as Alert from "./alert.tsx";

const onClose = fn<(event: MouseEvent<HTMLButtonElement>) => void>();

const message = (close: Partial<Alert.CloseProps> = {}) => (
  <>
    <Alert.Title>Couldn’t save changes</Alert.Title>
    <Alert.Description>The file is read-only. Duplicate it to edit.</Alert.Description>
    <Alert.Close aria-label="Dismiss" onClick={onClose} {...close} />
  </>
);

async function showsMessage({ canvas }: StoryContext) {
  await expect(canvas.getByText("The file is read-only. Duplicate it to edit.")).toBeVisible();
}

const meta = preview.meta({
  title: "Components/Alert",
  component: Alert.Root,
  subcomponents: partsOf(Alert),
  args: { variant: "danger", children: message() },
});

export const Default = meta.story({});

Default.test("reads at AA contrast as neutral", { args: { variant: "neutral" } }, showsMessage);

Default.test("reads at AA contrast as success", { args: { variant: "success" } }, showsMessage);

Default.test("reads at AA contrast as warning", { args: { variant: "warning" } }, showsMessage);

Default.test("is ordinary content without a role", async ({ canvas }) => {
  await expect(canvas.queryByRole("alert")).toBeNull();
  await expect(canvas.getByText("Couldn’t save changes")).toBeVisible();
});

Default.test(
  "is announced as an alert with role alert",
  { args: { role: "alert" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(/^Couldn’t save changes/v);
  },
);

Default.test(
  "reports the Dismiss press and dispatches a bubbling ab-dismiss",
  async ({ canvas, userEvent }) => {
    const close = canvas.getByRole("button", { name: "Dismiss" });
    const dismissals = listen("ab-dismiss");

    await userEvent.click(close);
    dismissals.stop();
    await expect(onClose).toHaveBeenCalledOnce();
    await expect(
      dismissals.events.map(({ target, bubbles, detail }) => ({ target, bubbles, detail })),
    ).toEqual([
      { target: close, bubbles: true, detail: { component: "Alert", userInitiated: true } },
    ]);
  },
);

Default.test(
  "keeps a disabled Dismiss focusable and blocks it",
  { args: { children: message({ disabled: true }) } },
  async ({ canvas, userEvent }) => {
    const close = canvas.getByRole("button", { name: "Dismiss" });
    const dismissals = listen("ab-dismiss");

    await userEvent.tab();
    await expect(close).toHaveFocus();
    await expect(close).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Enter}");
    await userEvent.click(close);
    dismissals.stop();
    await expect(onClose).not.toHaveBeenCalled();
    await expect(dismissals.events).toEqual([]);
  },
);
