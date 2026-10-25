import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@platform/ui/button";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import * as AlertDialog from "./alert-dialog.tsx";

const onDelete = fn();

const children = (
  <>
    <AlertDialog.Trigger asChild>
      <Button variant="danger">Delete project</Button>
    </AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Title>Delete project?</AlertDialog.Title>
      <AlertDialog.Description>This removes 12 files. You can’t undo this.</AlertDialog.Description>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action
          variant="danger"
          onClick={() => {
            onDelete();
          }}
        >
          Delete
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </>
);

const meta = preview.meta({
  title: "Components/AlertDialog",
  component: AlertDialog.Root,
  args: { children, onOpenChange: fn() },
});

export const Default = meta.story({});

Default.test(
  "opens as an alert dialog named and described by its message, focusing Cancel",
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    const dialog = canvas.getByRole("alertdialog", { name: "Delete project?" });
    await expect(dialog).toHaveAccessibleDescription("This removes 12 files. You can’t undo this.");
    await expect(canvas.getByRole("button", { name: "Cancel" })).toHaveFocus();
  },
);

Default.test(
  "treats Escape as Cancel: closes, returns focus to the Trigger and dispatches ab-dismiss",
  async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    const dismissals = listen("ab-dismiss");
    await (await trusted()).keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("alertdialog")).toBeNull());
    dismissals.stop();
    await expect(trigger).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "escape-key" }),
    );
    await expect(dismissals.events.map(({ detail }) => detail)).toEqual([
      { component: "AlertDialog", reason: "user" },
    ]);
  },
);

Default.test(
  "runs the Action, dispatches ab-confirm and closes",
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    const action = canvas.getByRole("button", { name: "Delete" });
    const confirmations = listen("ab-confirm");
    const dismissals = listen("ab-dismiss");
    await userEvent.click(action);
    confirmations.stop();
    dismissals.stop();
    await expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(canvas.queryByRole("alertdialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: "close-press" }),
    );
    await expect(confirmations.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: action, detail: { component: "AlertDialog", reason: "user" } },
    ]);
    await expect(dismissals.events).toEqual([]);
  },
);

Default.test("closes with Cancel and dispatches ab-dismiss", async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
  const cancel = canvas.getByRole("button", { name: "Cancel" });
  const dismissals = listen("ab-dismiss");
  await userEvent.click(cancel);
  dismissals.stop();
  await waitFor(() => expect(canvas.queryByRole("alertdialog")).toBeNull());
  await expect(onDelete).not.toHaveBeenCalled();
  await expect(dismissals.events.map(({ target }) => target)).toEqual([cancel]);
});

Default.test("stays open on a press on the backdrop", async ({ args, canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
  const dialog = canvas.getByRole("alertdialog");
  await userEvent.pointer({
    keys: "[MouseLeft]",
    target: dialog,
    coords: { clientX: 1, clientY: 1 },
  });
  await expect(canvas.getByRole("alertdialog")).toBe(dialog);
  await expect(args.onOpenChange).toHaveBeenCalledOnce();
});

Default.test(
  "stays open after the Action when onOpenChange cancels the close",
  {
    args: {
      onOpenChange: fn((open: boolean, details: AlertDialog.ChangeEventDetails) => {
        if (!open) details.cancel();
      }),
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    const confirmations = listen("ab-confirm");
    await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
    confirmations.stop();
    await expect(canvas.getByRole("alertdialog")).toBeInTheDocument();
    await expect(confirmations.events).toHaveLength(1);
  },
);
