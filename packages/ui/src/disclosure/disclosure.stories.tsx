import { expect, fn, waitFor } from "storybook/test";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import { Disclosure } from "./index.ts";

const limits = "Retries stop after five attempts, and the cache keeps responses for an hour.";

const meta = preview.meta({
  title: "Components/Disclosure",
  component: Disclosure.Root,
  subcomponents: partsOf(Disclosure),
  args: {
    children: (
      <>
        <Disclosure.Trigger>Advanced settings</Disclosure.Trigger>
        <Disclosure.Content id="limits">{limits}</Disclosure.Content>
      </>
    ),
    onOpenChange: fn<(open: boolean, details: Disclosure.ChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test(
  "opens and closes on a click, reporting each change and dispatching ab-toggle",
  async ({ canvas, userEvent, args }) => {
    const trigger = canvas.getByText("Advanced settings");
    const toggles = listen("ab-toggle");

    await expect(canvas.getByText(limits)).not.toBeVisible();
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByText(limits)).toBeVisible());
    await userEvent.click(trigger);
    toggles.stop();
    await waitFor(() => expect(canvas.getByText(limits)).not.toBeVisible());
    await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
    await expect(args.onOpenChange).toHaveBeenNthCalledWith(
      1,
      true,
      expect.objectContaining({ reason: "trigger-press" }),
    );
    await expect(args.onOpenChange).toHaveBeenNthCalledWith(2, false, expect.anything());
    await expect(toggles.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: trigger, detail: { component: "Disclosure", reason: "user" } },
      { target: trigger, detail: { component: "Disclosure", reason: "user" } },
    ]);
  },
);

Default.test("toggles the focused trigger with Enter and Space", async ({ canvas }) => {
  const user = await trusted();

  await user.keyboard("{Tab}");
  await expect(canvas.getByText("Advanced settings")).toHaveFocus();
  await user.keyboard("{Enter}");
  await waitFor(() => expect(canvas.getByText(limits)).toBeVisible());
  await user.keyboard(" ");
  await waitFor(() => expect(canvas.getByText(limits)).not.toBeVisible());
});

Default.test(
  "opens when a link points into it and reports reason none",
  async ({ canvas, args }) => {
    location.hash = "limits";
    await waitFor(() => expect(canvas.getByText(limits)).toBeVisible());
    history.replaceState(null, "", location.pathname + location.search);
    await expect(args.onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: "none" }),
    );
  },
);

Default.test(
  "starts open with defaultOpen",
  { args: { defaultOpen: true } },
  async ({ canvas }) => {
    await expect(canvas.getByText(limits)).toBeVisible();
  },
);

Default.test(
  "stays closed when the change is cancelled",
  {
    args: {
      onOpenChange: (_open, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const toggles = listen("ab-toggle");

    await userEvent.click(canvas.getByText("Advanced settings"));
    toggles.stop();
    await expect(canvas.getByText(limits)).not.toBeVisible();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "follows a controlled open",
  { args: { open: false } },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByText("Advanced settings"));
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await expect(canvas.getByText(limits)).not.toBeVisible();
  },
);
