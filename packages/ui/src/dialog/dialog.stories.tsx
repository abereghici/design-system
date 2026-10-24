import { useRef, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@platform/ui/button";
import { roRO } from "@platform/ui/locales/ro-RO";
import { Provider } from "@platform/ui/provider";
import { TextField } from "@platform/ui/text-field";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import type { Locale } from "../provider/locale.tsx";

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
    <Dialog.Close />
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
  title: "Components/Overlays/Dialog",
  component: Dialog.Root,
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
  "closes with the Close button, returns focus to the Trigger and dispatches ab-dismiss",
  async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Rename…" });
    await userEvent.click(trigger);
    const close = canvas.getByRole("button", { name: "Close" });
    const dismissals = listen("ab-dismiss");
    await userEvent.click(close);
    dismissals.stop();
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "close-press" }),
    );
    await expect(dismissals.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: close, detail: { component: "Dialog", reason: "user" } },
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

Default.test(
  "names Close in the Provider's locale",
  {
    args: { defaultOpen: true },
    decorators: [
      (Story) => (
        <Provider locale={roRO}>
          <Story />
        </Provider>
      ),
    ],
  },
  async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole("button", { name: "Închide" })).toBeVisible());
    // @ts-expect-error A locale must carry the Dialog labels.
    void ({ tag: "fr-FR", labels: { ...roRO.labels, dialog: {} } } satisfies Locale);
  },
);

Default.test(
  "takes a per-instance label over the locale",
  {
    args: {
      defaultOpen: true,
      children: (
        <Dialog.Content aria-label="Rename project">
          <Dialog.Close labels={{ close: "Dismiss rename" }} />
        </Dialog.Content>
      ),
    },
  },
  async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("dialog", { name: "Rename project" })).toBeVisible(),
    );
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: "Dismiss rename" })).toBeVisible(),
    );
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

export const Controlled = meta.story({
  render: (args) => <ControlledDialog {...args} />,
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
