import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@abereghici/ui/button";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import * as Sheet from "./sheet.tsx";

const lines = Array.from({ length: 30 }, (_, index) => `Line ${index + 1} · Design review · 2 h`);

const content = (props: Sheet.ContentProps = {}) => (
  <Sheet.Content {...props}>
    <Sheet.Title>Invoice 0142</Sheet.Title>
    <Sheet.Description>Issued 3 October to Moss & Co.</Sheet.Description>
    <Sheet.Body>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </Sheet.Body>
    <Sheet.Footer>
      <Sheet.Close asChild>
        <Button variant="primary">Done</Button>
      </Sheet.Close>
    </Sheet.Footer>
    <Sheet.Close aria-label="Close" />
  </Sheet.Content>
);

const children = (
  <>
    <Sheet.Trigger asChild>
      <Button>Open details</Button>
    </Sheet.Trigger>
    {content()}
  </>
);

const meta = preview.meta({
  title: "Components/Sheet",
  component: Sheet.Root,
  subcomponents: partsOf(Sheet),
  args: { children, onOpenChange: fn() },
});

export const Default = meta.story({});

Default.test(
  "opens as a modal named by its Title, focusing the scrollable Body",
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open details" }));

    const sheet = canvas.getByRole("dialog", { name: "Invoice 0142" });

    await expect(sheet).toHaveAccessibleDescription("Issued 3 October to Moss & Co.");
    await expect(document.activeElement).toHaveTextContent(/^Line 1 ·/v);
    await expect(args.onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: "trigger-press" }),
    );
  },
);

Default.test(
  "closes with the Close button, returns focus to the Trigger and dispatches ab-dismiss",
  async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Open details" });

    await userEvent.click(trigger);

    const close = canvas.getByRole("button", { name: "Close" });
    const dismissals = listen("ab-dismiss");

    await userEvent.click(close);
    dismissals.stop();
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(dismissals.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: close, detail: { component: "Sheet", userInitiated: true } },
    ]);
  },
);

Default.test(
  "closes on Escape, returns focus to the Trigger and dispatches ab-dismiss",
  async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Open details" });

    await userEvent.click(trigger);

    const dismissals = listen("ab-dismiss");

    await (await trusted()).keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    dismissals.stop();
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "escape-key" }),
    );
    await expect(dismissals.events.map(({ detail }) => detail)).toEqual([
      { component: "Sheet", userInitiated: true },
    ]);
  },
);

Default.test(
  "closes on a press on the backdrop beside the panel",
  { args: { children: content({ side: "start" }), defaultOpen: true } },
  async ({ args, canvas, userEvent }) => {
    const sheet = canvas.getByRole("dialog");

    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: sheet,
      coords: { clientX: innerWidth - 2, clientY: innerHeight / 2 },
    });
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "outside-press" }),
    );
  },
);
