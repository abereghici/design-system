import { expect, fn, waitFor, within } from "storybook/test";

import type { Decorator } from "@storybook/react-vite";

import { Button } from "@platform/ui/button";
import { roRO } from "@platform/ui/locales/ro-RO";
import { Provider } from "@platform/ui/provider";
import { toast } from "@platform/ui/toast";
import type { Locale } from "@platform/ui/provider";

import preview from "#.storybook/preview.tsx";
import { trusted } from "#.storybook/test/trusted.ts";

import { remove, snapshot } from "../toast/toast.ts";

import { Toaster } from "./toaster.tsx";

// @ts-expect-error -- a locale must name the Toaster region and the toast's Dismiss button
({ tag: "fr-FR", labels: { ...roRO.labels, toaster: {} } }) satisfies Locale;

const page = within(document.body);
const region = () => page.findByRole("region", { name: "Notifications" });
const settle = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const topmost = (element: Element) => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return element.contains(document.elementFromPoint(x + width / 2, y + height / 2));
};

const withSave: Decorator = (Story) => (
  <>
    <Button>Save</Button>
    <Story />
  </>
);

const withDialog: Decorator = (Story) => (
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
  beforeEach: () => () => {
    for (const { id } of snapshot()) remove(id);
  },
});

export const Default = meta.story({});

Default.test("is a landmark only while toasts show", async () => {
  await expect(page.queryByRole("region")).toBeNull();
  const id = toast({ title: "Link copied", duration: Infinity });
  await expect(await region()).toHaveAttribute("aria-keyshortcuts", "Alt+T");
  toast.dismiss(id);
  await waitFor(() => expect(page.queryByRole("region")).toBeNull());
});

Default.test(
  "takes its names from the locale, and the labels prop wins",
  {
    decorators: [
      (Story) => (
        <Provider locale={roRO}>
          <Story />
        </Provider>
      ),
    ],
  },
  async () => {
    toast({ title: "Link copiat", duration: Infinity });
    const toasts = within(await page.findByRole("region", { name: "Notificări" }));
    await expect(toasts.getByRole("button", { name: "Închide" })).toBeInTheDocument();
  },
);

Default.test(
  "uses the labels prop over the locale",
  { args: { labels: { region: "Alerts", close: "Hide" } } },
  async () => {
    toast({ title: "Link copied", duration: Infinity });
    const toasts = within(await page.findByRole("region", { name: "Alerts" }));
    await expect(toasts.getByRole("button", { name: "Hide" })).toBeInTheDocument();
  },
);

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

Default.test(
  "stays on top of an open popover and inside an open modal dialog",
  { decorators: [withDialog] },
  async ({ canvas, userEvent }) => {
    const undo = fn<() => void>();
    const menu = canvas.getByRole("menu", { hidden: true });
    menu.showPopover();
    toast({ title: "Archived", action: { label: "Undo", onClick: undo }, duration: Infinity });
    const archived = within(await region()).getByRole("button", { name: "Undo" });
    await waitFor(() => expect(topmost(archived)).toBe(true));
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
    await expect(renamed !== undefined && topmost(renamed)).toBe(true);
    const user = await trusted();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByText("Renamed", { selector: "div" })).toBeNull());
    await expect(dialog).toBeVisible();
    within(dialog).getByRole("button", { name: "Rename" }).focus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeVisible());
  },
);
