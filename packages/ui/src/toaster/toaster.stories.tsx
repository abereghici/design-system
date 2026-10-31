import { expect, fn, waitFor, within } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import { Button } from "@abereghici/ui/button";
import { toast } from "@abereghici/ui/toast";

import preview from "#.storybook/preview.tsx";
import { atCentre } from "#.storybook/test/pointer.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import { remove, snapshot } from "../toast/toast.ts";

import { Toaster } from "./toaster.tsx";

const page = within(document.body);
const region = () => page.findByRole("region", { name: "Notifications" });
const settle = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const withSave: Decorator = (Story) => (
  <>
    <Button>Save</Button>
    <Story />
  </>
);

const withModalAndPopover: Decorator = (Story) => (
  <>
    <button
      type="button"
      onClick={(event) => {
        event.currentTarget.nextElementSibling?.querySelector("dialog")?.showModal();
      }}
    >
      Edit
    </button>
    <div>
      <dialog aria-label="Edit profile">
        <button type="button">Rename</button>
      </dialog>
      <div popover="auto" aria-label="Menu" role="menu">
        <button type="button" role="menuitem">
          Archive
        </button>
      </div>
    </div>
    <Story />
  </>
);

const meta = preview.meta({
  title: "Components/Toaster",
  component: Toaster,
  args: { "aria-label": "Notifications", closeLabel: "Dismiss" },
  // Test cleanup from the store itself: no public call clears every toast, and toast.dismiss
  // leaves each one exiting into the next proof.
  beforeEach: () => () => {
    for (const { id } of snapshot()) remove(id);
  },
});

// Shows nothing until a toast arrives, so its screenshot would be blank; Stacked shows toasts.
export const Default = meta.story({ tags: ["!screenshot"] });

Default.test("is a landmark only while toasts show", async () => {
  await expect(page.queryByRole("region")).toBeNull();

  const id = toast({ title: "Link copied", duration: Infinity });

  await expect(await region()).toHaveAttribute("aria-keyshortcuts", "Alt+T");
  toast.dismiss(id);
  await waitFor(() => expect(page.queryByRole("region")).toBeNull());
});

Default.test("pauses timers while hovered and while focus is inside", async ({ userEvent }) => {
  toast({ title: "Saved", duration: 600 });

  const title = await page.findByText("Saved", { selector: "div" });

  await userEvent.hover(title);
  await settle(1000);
  await expect(title).toBeInTheDocument();
  page.getByRole("button", { name: "Dismiss" }).focus();
  await userEvent.unhover(title);
  await settle(1000);
  await expect(title).toBeInTheDocument();
  page.getByRole("button", { name: "Dismiss" }).blur();
  await waitFor(() => expect(page.queryByRole("region")).toBeNull(), { timeout: 2000 });
});

Default.test(
  "focuses on Alt+T and returns focus on Escape",
  { decorators: [withSave] },
  async ({ canvas, userEvent }) => {
    toast({ title: "Link copied", duration: Infinity });

    const save = canvas.getByRole("button", { name: "Save" });

    save.focus();
    await userEvent.keyboard("{Alt>}t{/Alt}");
    await expect(await region()).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(save).toHaveFocus();
  },
);

Default.test(
  "moves focus to the next toast on dismiss, then back to where it was",
  { decorators: [withSave] },
  async ({ canvas, userEvent }) => {
    toast({ title: "Older", duration: Infinity });
    toast({ title: "Newer", duration: Infinity });

    const save = canvas.getByRole("button", { name: "Save" });

    save.focus();
    await userEvent.keyboard("{Alt>}t{/Alt}");
    await userEvent.tab();

    const [newer, older] = within(await region()).getAllByRole("button", { name: "Dismiss" });

    await expect(newer).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(older).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(save).toHaveFocus();
  },
);

Default.test(
  "stays on top of an open popover and inside an open modal dialog",
  { decorators: [withModalAndPopover] },
  async ({ canvas, userEvent }) => {
    const undo = fn<() => void>();
    const menu = canvas.getByRole("menu", { hidden: true });

    menu.showPopover();
    toast({ title: "Archived", action: { label: "Undo", onClick: undo }, duration: Infinity });

    const archived = within(await region()).getByRole("button", { name: "Undo" });

    await waitFor(() => expect(archived.contains(atCentre(archived))).toBe(true));
    menu.hidePopover();

    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));

    const dialog = page.getByRole("dialog", { name: "Edit profile" });

    toast({ title: "Renamed", action: { label: "Undo", onClick: undo }, duration: Infinity });
    await waitFor(() =>
      expect(within(dialog).getByText("Renamed", { selector: "div" })).toBeVisible(),
    );
    await waitFor(() => expect(within(dialog).getByRole("status")).toHaveTextContent("Renamed"));
    within(dialog).getByRole("button", { name: "Rename" }).focus();
    await userEvent.tab();

    const renamed = within(dialog).getAllByRole("button", { name: "Undo" })[0];

    await expect(renamed).toHaveFocus();
    await expect(renamed?.contains(atCentre(renamed))).toBe(true);

    const user = await trusted();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByText("Renamed", { selector: "div" })).toBeNull());
    await expect(dialog).toBeVisible();
    within(dialog).getByRole("button", { name: "Rename" }).focus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeVisible());
  },
);

export const Stacked = meta.story({
  decorators: [withSave],
  beforeEach: () => {
    for (const title of ["Uploaded 1 file", "Uploaded 2 files", "Uploaded 3 files", "Done"]) {
      toast({ title, duration: Infinity });
    }
  },
});

Stacked.test(
  "lists three toasts, newest first, and only those take focus",
  async ({ userEvent }) => {
    const toasts = within(await region());

    await expect(toasts.getAllByRole("listitem").at(0)).toHaveTextContent("Done");
    await userEvent.keyboard("{Alt>}t{/Alt}");

    const dismisses = toasts.getAllByRole("button", { name: "Dismiss" });

    for (const dismiss of dismisses.slice(0, 3)) {
      await userEvent.tab();
      await expect(dismiss).toHaveFocus();
    }

    dismisses[3]?.focus();
    await expect(dismisses[2]).toHaveFocus();
  },
);
