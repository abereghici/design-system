import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@abereghici/ui/button";
import { CopyIcon } from "@abereghici/ui/icons/copy";
import { TrashIcon } from "@abereghici/ui/icons/trash";
import { Kbd } from "@abereghici/ui/kbd";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { parkPointer, trusted } from "#.storybook/test/trusted.ts";

import * as ContextMenu from "./context-menu.tsx";

const onOpenChange = fn<NonNullable<ContextMenu.RootProps["onOpenChange"]>>();
const onDuplicate = fn<() => void>();

const reasons = () => onOpenChange.mock.calls.map(([open, { reason }]) => [open, reason]);

const meta = preview.meta({
  title: "Components/ContextMenu",
  component: ContextMenu.Root,
  subcomponents: partsOf(ContextMenu),
  args: {
    onOpenChange,
    children: (
      <>
        <ContextMenu.Trigger style={{ padding: "2rem", border: "1px dashed" }}>
          <Button variant="secondary">Report.pdf</Button>
        </ContextMenu.Trigger>
        <ContextMenu.Content aria-label="File actions">
          <ContextMenu.Item onClick={onDuplicate} aria-keyshortcuts="Meta+D Control+D">
            <CopyIcon />
            Duplicate
            <Kbd keys="mod+d" aria-hidden />
          </ContextMenu.Item>
          <ContextMenu.CheckboxItem>Pinned</ContextMenu.CheckboxItem>
          <ContextMenu.Separator />
          <ContextMenu.Item variant="danger">
            <TrashIcon />
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </>
    ),
  },
  beforeEach: parkPointer,
  decorators: [
    (Story) => (
      <div style={{ paddingBlockEnd: "14rem" }}>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({});

Default.test("opens on a right click at its first item", async ({ canvas }) => {
  const user = await trusted();

  await user.click(canvas.getByRole("button", { name: "Report.pdf" }), { button: "right" });
  await waitFor(() => expect(canvas.getByRole("menu", { name: "File actions" })).toBeVisible());
  await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus());
  await expect(reasons()).toEqual([[true, "trigger-press"]]);
});

Default.test("moves with the arrow keys, wrapping, and End", async ({ canvas }) => {
  const user = await trusted();
  const item = (name: string) => canvas.getByRole("menuitem", { name });

  await user.click(canvas.getByRole("button", { name: "Report.pdf" }), { button: "right" });
  await waitFor(() => expect(item("Duplicate")).toHaveFocus());
  await user.keyboard("{End}");
  await expect(item("Delete")).toHaveFocus();
  await user.keyboard("{ArrowDown}");
  await expect(item("Duplicate")).toHaveFocus();
  await user.keyboard("{ArrowDown}");
  await expect(canvas.getByRole("menuitemcheckbox", { name: "Pinned" })).toHaveFocus();
});

Default.test(
  "closes on Escape, returns focus to where it was and dispatches ab-dismiss",
  async ({ canvas }) => {
    const user = await trusted();
    const file = canvas.getByRole("button", { name: "Report.pdf" });

    await user.keyboard("{Tab}");
    await expect(file).toHaveFocus();
    await user.click(file, { button: "right" });
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus());

    const dismissals = listen("ab-dismiss");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(file).toHaveFocus());
    dismissals.stop();
    await expect(dismissals.events.map(({ detail }) => detail)).toEqual([
      { component: "ContextMenu", userInitiated: true },
    ]);
  },
);

Default.test("runs an item and closes, dispatching ab-press", async ({ canvas }) => {
  const user = await trusted();

  await user.click(canvas.getByRole("button", { name: "Report.pdf" }), { button: "right" });
  await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus());

  const presses = listen("ab-press");

  await user.keyboard("{Enter}");
  presses.stop();
  await expect(onDuplicate).toHaveBeenCalledOnce();
  await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
  await expect(presses.events.map(({ detail }) => detail)).toEqual([
    { component: "ContextMenu", userInitiated: true },
  ]);
  await expect(reasons().at(-1)).toEqual([false, "item-press"]);
});

Default.test(
  "leaves the browser's menu alone when disabled",
  {
    args: {
      children: (
        <>
          <ContextMenu.Trigger disabled>
            <Button variant="secondary">Report.pdf</Button>
          </ContextMenu.Trigger>
          <ContextMenu.Content aria-label="File actions">
            <ContextMenu.Item>Duplicate</ContextMenu.Item>
          </ContextMenu.Content>
        </>
      ),
    },
  },
  async ({ canvas }) => {
    const user = await trusted();
    const menus = listen("contextmenu");

    await user.click(canvas.getByRole("button", { name: "Report.pdf" }), { button: "right" });
    menus.stop();
    await expect(menus.events.map(({ defaultPrevented }) => defaultPrevented)).toEqual([false]);
    await expect(canvas.queryByRole("menu")).toBeNull();
  },
);

Default.test(
  "opens from the keyboard at the focused element and returns focus there",
  async ({ canvas }) => {
    const user = await trusted();
    const file = canvas.getByRole("button", { name: "Report.pdf" });

    await user.keyboard("{Tab}");
    await expect(file).toHaveFocus();
    // Shift+F10 and the context-menu key reach the page through the OS, which Playwright's keys bypass, so the proof dispatches the contextmenu event they produce: no pointer button.
    file.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 0 }),
    );
    await waitFor(() => expect(canvas.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(file).toHaveFocus());
  },
);

Default.test(
  "opens on a long touch press once released, not on a tap",
  async ({ canvas, userEvent }) => {
    const file = canvas.getByRole("button", { name: "Report.pdf" });

    await userEvent.pointer({ keys: "[TouchA]", target: file });
    await expect(canvas.queryByRole("menu")).toBeNull();
    await userEvent.pointer({ keys: "[TouchA>]", target: file });
    await new Promise((resolve) => {
      setTimeout(resolve, 800);
    });
    await expect(canvas.queryByRole("menu")).toBeNull();
    await userEvent.pointer({ keys: "[/TouchA]", target: file });
    await waitFor(() => expect(canvas.getByRole("menu", { name: "File actions" })).toBeVisible());
    await expect(reasons().at(-1)).toEqual([true, "trigger-press"]);
  },
);

export const Open = Default.extend({
  parameters: { docs: { description: { story: "Open from a right click on its target." } } },
  play: async ({ canvas }) => {
    const user = await trusted().catch(() => null);

    await user?.click(canvas.getByRole("button", { name: "Report.pdf" }), { button: "right" });
  },
});
