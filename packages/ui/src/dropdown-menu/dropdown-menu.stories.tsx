import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@platform/ui/button";
import { Dialog } from "@platform/ui/dialog";
import { CopyIcon } from "@platform/ui/icons/copy";
import { TrashIcon } from "@platform/ui/icons/trash";
import { Kbd } from "@platform/ui/kbd";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { parkPointer, trusted } from "#.storybook/test/trusted.ts";

import * as DropdownMenu from "./dropdown-menu.tsx";

const onOpenChange = fn<NonNullable<DropdownMenu.RootProps["onOpenChange"]>>();
const onDuplicate = fn<() => void>();
const onSortChange = fn<NonNullable<DropdownMenu.RadioGroupProps["onValueChange"]>>();
const onArchivedChange = fn<NonNullable<DropdownMenu.CheckboxItemProps["onCheckedChange"]>>();

async function openWithKeyboard() {
  const user = await trusted();
  await user.keyboard("{Tab}{Enter}");
  const first = document.querySelector('[role="menuitem"]');
  await waitFor(() => expect(first).toHaveFocus());
}

const reasons = () => onOpenChange.mock.calls.map(([open, { reason }]) => [open, reason]);

const meta = preview.meta({
  title: "Components/DropdownMenu",
  component: DropdownMenu.Root,
  subcomponents: partsOf(DropdownMenu),
  args: {
    onOpenChange,
    children: (
      <>
        <DropdownMenu.Trigger asChild>
          <Button>Actions</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={onDuplicate} aria-keyshortcuts="Meta+D Control+D">
            <CopyIcon />
            Duplicate
            <Kbd keys="mod+d" aria-hidden />
          </DropdownMenu.Item>
          <DropdownMenu.Item disabled>Rename…</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.RadioGroup defaultValue="newest" onValueChange={onSortChange}>
            <DropdownMenu.Label>Sort by</DropdownMenu.Label>
            <DropdownMenu.RadioItem value="newest">Newest</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="oldest">Oldest</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
          <DropdownMenu.CheckboxItem onCheckedChange={onArchivedChange}>
            Show archived
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.Separator />
          <DropdownMenu.Item variant="danger">
            <TrashIcon />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </>
    ),
  },
  beforeEach: parkPointer,
  decorators: [
    (Story) => (
      <div style={{ display: "flex", gap: "0.5rem", paddingBlockEnd: "18rem" }}>
        <Story />
        <Button variant="tertiary">After</Button>
      </div>
    ),
  ],
});

export const Default = meta.story({});

Default.test("opens from the keyboard at its first item", async ({ canvas }) => {
  const user = await trusted();
  const trigger = canvas.getByRole("button", { name: "Actions" });
  await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  await user.keyboard("{Tab}{Enter}");
  await waitFor(() => expect(canvas.getByRole("menu", { name: "Actions" })).toBeVisible());
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(canvas.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
});

Default.test("opens at its last item on Up Arrow", async ({ canvas }) => {
  const user = await trusted();
  await user.keyboard("{Tab}{ArrowUp}");
  await expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
});

Default.test("moves with the arrow keys, wrapping, Home, End and typing", async ({ canvas }) => {
  const user = await trusted();
  await openWithKeyboard();
  await user.keyboard("{ArrowUp}");
  await expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  await user.keyboard("{ArrowDown}{ArrowDown}");
  await expect(canvas.getByRole("menuitem", { name: "Rename…" })).toHaveFocus();
  await user.keyboard("{End}");
  await expect(canvas.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  await user.keyboard("{Home}");
  await expect(canvas.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
  await user.keyboard("o");
  await expect(canvas.getByRole("menuitemradio", { name: "Oldest" })).toHaveFocus();
  await user.keyboard("{ArrowUp}");
  await expect(canvas.getByRole("menuitemradio", { name: "Newest" })).toHaveFocus();
});

Default.test(
  "closes on Escape, returns focus to the Trigger and dispatches ab-dismiss",
  async ({ canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await user.click(trigger);
    await expect(canvas.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    const dismissals = listen("ab-dismiss");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    dismissals.stop();
    await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
    await expect(dismissals.events.map(({ detail }) => detail)).toEqual([
      { component: "DropdownMenu", reason: "user" },
    ]);
    await expect(reasons()).toEqual([
      [true, "trigger-press"],
      [false, "escape-key"],
    ]);
  },
);

Default.test("closes on a press outside", async ({ canvas }) => {
  const user = await trusted();
  await user.click(canvas.getByRole("button", { name: "Actions" }));
  await user.click(document.body, { position: { x: 600, y: 5 } });
  await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
  await expect(reasons().at(-1)).toEqual([false, "outside-press"]);
});

Default.test(
  "closes before an item's action runs, then dispatches ab-press",
  async ({ canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await openWithKeyboard();
    const presses = listen("ab-press");
    await user.keyboard("{Enter}");
    presses.stop();
    await expect(onDuplicate).toHaveBeenCalledOnce();
    await expect(trigger).toHaveFocus();
    await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
    await expect(presses.events.map(({ detail }) => detail)).toContainEqual({
      component: "DropdownMenu",
      reason: "user",
    });
    await expect(reasons().at(-1)).toEqual([false, "item-press"]);
  },
);

Default.test("keeps a disabled item focusable and inert", async ({ canvas }) => {
  const user = await trusted();
  await openWithKeyboard();
  await user.keyboard("{ArrowDown}");
  const rename = canvas.getByRole("menuitem", { name: "Rename…" });
  await expect(rename).toHaveFocus();
  await expect(rename).toHaveAttribute("aria-disabled", "true");
  await user.keyboard("{Enter}");
  await waitFor(() => expect(canvas.getByRole("menu")).toBeVisible());
});

Default.test(
  "toggles a CheckboxItem on Space and stays open, dispatching ab-toggle",
  async ({ canvas }) => {
    const user = await trusted();
    await openWithKeyboard();
    await user.keyboard("{End}{ArrowUp}");
    const item = canvas.getByRole("menuitemcheckbox", { name: "Show archived" });
    await expect(item).toHaveAttribute("aria-checked", "false");
    const toggles = listen("ab-toggle");
    await user.keyboard(" ");
    toggles.stop();
    await expect(item).toHaveAttribute("aria-checked", "true");
    await expect(item).toHaveFocus();
    await expect(toggles.events.map(({ detail }) => detail)).toEqual([
      { component: "DropdownMenu", reason: "user" },
    ]);
  },
);

Default.test("chooses a RadioItem and closes on Enter", async ({ canvas }) => {
  const user = await trusted();
  await openWithKeyboard();
  await user.keyboard("o");
  await user.keyboard("{Enter}");
  await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
  await expect(onSortChange.mock.calls.map(([value, { reason }]) => [value, reason])).toEqual([
    ["oldest", "item-press"],
  ]);
  await user.keyboard("{Enter}");
  await expect(canvas.getByRole("menuitemradio", { name: "Oldest" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await waitFor(() => expect(canvas.getByRole("group", { name: "Sort by" })).toBeVisible());
});

Default.test("keeps the choices and stays open when a change is cancelled", async ({ canvas }) => {
  onSortChange.mockImplementationOnce((_value, details) => {
    details.cancel();
  });
  onArchivedChange.mockImplementationOnce((_checked, details) => {
    details.cancel();
  });
  const user = await trusted();
  await openWithKeyboard();
  await user.keyboard("o{Enter}{End}{ArrowUp} ");
  await expect(canvas.getByRole("menuitemradio", { name: "Oldest" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(canvas.getByRole("menuitemcheckbox", { name: "Show archived" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(canvas.getByRole("button", { name: "Actions" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(reasons()).toEqual([[true, "trigger-press"]]);
});

Default.test("closes when Tab moves focus on", async ({ canvas }) => {
  const user = await trusted();
  await openWithKeyboard();
  await user.keyboard("{Tab}");
  await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
  await expect(reasons().at(-1)).toEqual([false, "focus-out"]);
});

Default.test("highlights the item under the pointer", async ({ canvas }) => {
  const user = await trusted();
  await user.click(canvas.getByRole("button", { name: "Actions" }));
  await user.hover(canvas.getByRole("menuitemradio", { name: "Oldest" }));
  await expect(canvas.getByRole("menuitemradio", { name: "Oldest" })).toHaveFocus();
});

Default.test(
  "Escape closes only the topmost layer: the menu, then the Dialog it sits in",
  {
    render: () => (
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button>Rename…</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Rename project?</Dialog.Title>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button>Actions</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Dialog.Content>
      </Dialog.Root>
    ),
  },
  async ({ canvas }) => {
    const user = await trusted();
    await user.click(canvas.getByRole("button", { name: "Rename…" }));
    canvas.getByRole("button", { name: "Actions" }).focus();
    await user.keyboard("{Enter}");
    await expect(canvas.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("menu")).toBeNull());
    await expect(canvas.getByRole("button", { name: "Actions" })).toHaveFocus();
    await waitFor(() =>
      expect(canvas.getByRole("dialog", { name: "Rename project?" })).toBeVisible(),
    );
    await user.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
);
