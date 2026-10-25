import type { MouseEvent } from "react";
import { expect, fn } from "storybook/test";

import { roRO } from "@platform/ui/locales/ro-RO";
import { Provider } from "@platform/ui/provider";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import type { Locale } from "../provider/locale.tsx";

import * as Alert from "./alert.tsx";

const onClose = fn<(event: MouseEvent<HTMLButtonElement>) => void>();

const message = (close: Alert.CloseProps = {}) => (
  <>
    <Alert.Title>Couldn’t save changes</Alert.Title>
    <Alert.Description>The file is read-only. Duplicate it to edit.</Alert.Description>
    <Alert.Close onClick={onClose} {...close} />
  </>
);

const meta = preview.meta({
  title: "Components/Alert",
  component: Alert.Root,
  subcomponents: partsOf(Alert),
  args: { variant: "danger", children: message() },
});

export const Default = meta.story({});

for (const variant of ["neutral", "success", "warning"] as const) {
  Default.test(`reads at AA contrast as ${variant}`, { args: { variant } }, async ({ canvas }) => {
    await expect(canvas.getByText("The file is read-only. Duplicate it to edit.")).toBeVisible();
  });
}

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
  "calls onClick, then dispatches a bubbling ab-dismiss, when Dismiss is pressed",
  async ({ canvas, userEvent }) => {
    const close = canvas.getByRole("button", { name: "Dismiss" });
    const dismissals = listen("ab-dismiss");
    await userEvent.click(close);
    dismissals.stop();
    await expect(onClose).toHaveBeenCalledOnce();
    await expect(
      dismissals.events.map(({ target, bubbles, detail }) => ({ target, bubbles, detail })),
    ).toEqual([{ target: close, bubbles: true, detail: { component: "Alert", reason: "user" } }]);
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

Default.test(
  "names Dismiss in the Provider's locale",
  {
    decorators: [
      (Story) => (
        <Provider locale={roRO}>
          <Story />
        </Provider>
      ),
    ],
  },
  async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Închide" })).toBeVisible();
    // @ts-expect-error -- a locale must carry the Alert labels
    void ({ tag: "fr-FR", labels: {} } satisfies Locale);
  },
);

Default.test(
  "takes a per-instance label over the locale",
  { args: { children: message({ labels: { close: "Hide message" } }) } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Hide message" })).toBeVisible();
  },
);
