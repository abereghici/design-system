import { useRef, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@abereghici/ui/button";
import { TextField } from "@abereghici/ui/text-field";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen, listenFeedback } from "#.storybook/test/listen.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import * as Dialog from "./dialog.tsx";

const content = (props: Dialog.ContentProps = {}) => (
  <Dialog.Content {...props}>
    <Dialog.Title>Rename project?</Dialog.Title>
    <Dialog.Description>Links to the old name keep working.</Dialog.Description>
    <TextField label="Name" defaultValue="Atlas" />
    <Dialog.Footer>
      <Dialog.Close asChild>
        <Button>Cancel</Button>
      </Dialog.Close>
      <Button variant="primary">Rename</Button>
    </Dialog.Footer>
    <Dialog.Close aria-label="Close" />
  </Dialog.Content>
);

const children = (
  <>
    <Dialog.Trigger asChild>
      <Button>Rename…</Button>
    </Dialog.Trigger>
    {content()}
  </>
);

const meta = preview.meta({
  title: "Components/Dialog",
  component: Dialog.Root,
  subcomponents: partsOf(Dialog),
  args: { children, onOpenChange: fn() },
});

export const Default = meta.story({});

Default.test(
  "opens as a modal named by its Title and described by its Description, focusing the first field",
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rename…" }));

    const dialog = canvas.getByRole("dialog", { name: "Rename project?" });

    await expect(dialog).toHaveAccessibleDescription("Links to the old name keep working.");
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: "trigger-press" }),
    );
  },
);

Default.test(
  "closes with the Close button, returns focus to the Trigger and dispatches one Feedback event, ab-dismiss",
  async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Rename…" });

    await userEvent.click(trigger);

    const close = canvas.getByRole("button", { name: "Close" });
    const feedback = listenFeedback();

    await userEvent.click(close);
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "close-press" }),
    );
    feedback.stop();
    await expect(
      feedback.events.map(({ type, target, detail }) => ({ type, target, detail })),
    ).toEqual([
      { type: "ab-dismiss", target: close, detail: { component: "Dialog", userInitiated: true } },
    ]);
  },
);

Default.test(
  "closes with a Cancel button without dispatching ab-dismiss",
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rename…" }));

    const dismissals = listen("ab-dismiss");

    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    dismissals.stop();
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "close-press" }),
    );
    await expect(dismissals.events).toEqual([]);
  },
);

Default.test(
  "closes on a press on the backdrop but not inside the dialog",
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rename…" }));

    const dialog = canvas.getByRole("dialog");

    await userEvent.click(canvas.getByText("Links to the old name keep working."));
    await waitFor(() => expect(dialog).toBeVisible());

    const dismissals = listen("ab-dismiss");

    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: dialog,
      coords: { clientX: 1, clientY: 1 },
    });
    dismissals.stop();
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "outside-press" }),
    );
    await expect(dismissals.events.map(({ target }) => target)).toEqual([dialog]);
  },
);

Default.test(
  "stays closed and open when onOpenChange cancels",
  {
    args: {
      onOpenChange: fn((_open: boolean, details: Dialog.ChangeEventDetails) => {
        details.cancel();
      }),
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rename…" }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
);

Default.test(
  "focuses initialFocus instead of the first field",
  {
    render: function InitialFocus(args) {
      const rename = useRef<HTMLButtonElement>(null);

      return (
        <Dialog.Root {...args}>
          <Dialog.Trigger>Rename…</Dialog.Trigger>
          <Dialog.Content initialFocus={rename}>
            <Dialog.Title>Rename project?</Dialog.Title>
            <TextField label="Name" />
            <Button ref={rename}>Rename</Button>
          </Dialog.Content>
        </Dialog.Root>
      );
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Rename…" }));
    await expect(canvas.getByRole("button", { name: "Rename" })).toHaveFocus();
  },
);

function ControlledDialog(props: Dialog.RootProps) {
  const [open, setOpen] = useState(props.open ?? false);

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Rename…
      </Button>
      <Dialog.Root
        {...props}
        open={open}
        onOpenChange={(next, details) => {
          props.onOpenChange?.(next, details);
          setOpen(next);
        }}
      >
        {content()}
      </Dialog.Root>
    </>
  );
}

Default.test(
  "closes on Escape and returns focus to the Trigger",
  async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Rename…" });

    await userEvent.click(trigger);
    await expect(canvas.getByRole("textbox", { name: "Name" })).toHaveFocus();
    await (await trusted()).keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "escape-key" }),
    );
  },
);

export const Controlled = meta.story({
  render: ControlledDialog,
  parameters: {
    docs: { description: { story: "The parent holds `open` and updates it on change." } },
  },
});

Controlled.test("opens and closes through open", async ({ args, canvas, userEvent }) => {
  const opener = canvas.getByRole("button", { name: "Rename…" });

  await userEvent.click(opener);
  await waitFor(() =>
    expect(canvas.getByRole("dialog", { name: "Rename project?" })).toBeVisible(),
  );
  await expect(args.onOpenChange).not.toHaveBeenCalled();
  await userEvent.click(canvas.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await expect(args.onOpenChange).toHaveBeenCalledWith(
    false,
    expect.objectContaining({ reason: "close-press" }),
  );
});
