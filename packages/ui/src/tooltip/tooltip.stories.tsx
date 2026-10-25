import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@platform/ui/button";
import { IconButton } from "@platform/ui/icon-button";
import { CopyIcon } from "@platform/ui/icons/copy";
import { PinIcon } from "@platform/ui/icons/pin";
import { Kbd } from "@platform/ui/kbd";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { parkPointer, trusted } from "#.storybook/test/trusted.ts";

import * as Tooltip from "./tooltip.tsx";

const onOpenChange = fn<NonNullable<Tooltip.RootProps["onOpenChange"]>>();

const reasons = () => onOpenChange.mock.calls.map(([open, { reason }]) => [open, reason]);

const meta = preview.meta({
  title: "Components/Tooltip",
  component: Tooltip.Root,
  subcomponents: partsOf(Tooltip),
  args: {
    onOpenChange,
    children: (
      <>
        <Tooltip.Trigger asChild>
          <IconButton aria-label="Copy link" aria-keyshortcuts="Meta+C Control+C">
            <CopyIcon />
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Copy link <Kbd keys="mod+c" aria-hidden />
        </Tooltip.Content>
      </>
    ),
  },
  beforeEach: parkPointer,
  decorators: [
    (Story) => (
      <div style={{ paddingBlock: "3rem", display: "flex", gap: "0.5rem" }}>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({});

Default.test("describes its Trigger, which keeps its own name", async ({ canvas }) => {
  const trigger = canvas.getByRole("button", { name: "Copy link" });

  await expect(trigger).toHaveAccessibleDescription(/^Copy link/v);
  await expect(canvas.queryByRole("tooltip")).toBeNull();
});

Default.test(
  "shows on hover after its delay and hides when the pointer leaves",
  async ({ canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Copy link" });

    await user.hover(trigger);
    await waitFor(() => expect(canvas.getByRole("tooltip")).toBeVisible());
    await expect(canvas.getByRole("tooltip")).toHaveTextContent(/^Copy link/v);
    await user.unhover(trigger);
    await waitFor(() => expect(canvas.queryByRole("tooltip")).toBeNull());
    await expect(reasons()).toEqual([
      [true, "trigger-hover"],
      [false, "trigger-hover"],
    ]);
  },
);

Default.test("stays open while the pointer moves onto it", async ({ canvas }) => {
  const user = await trusted();

  await user.hover(canvas.getByRole("button", { name: "Copy link" }));
  await waitFor(() => expect(canvas.getByRole("tooltip")).toBeVisible());
  await user.hover(canvas.getByRole("tooltip"));
  await expect(canvas.getByRole("tooltip")).toBeVisible();
});

Default.test(
  "shows at once on keyboard focus and Escape hides it with focus kept",
  async ({ canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Copy link" });

    await user.keyboard("{Tab}");
    await expect(trigger).toHaveFocus();
    await expect(canvas.getByRole("tooltip")).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("tooltip")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(reasons()).toEqual([
      [true, "trigger-focus"],
      [false, "escape-key"],
    ]);
  },
);

Default.test("hides when its Trigger is pressed", async ({ canvas }) => {
  const user = await trusted();

  await user.keyboard("{Tab}");
  await expect(canvas.getByRole("tooltip")).toBeVisible();
  await user.keyboard("{Enter}");
  await waitFor(() => expect(canvas.queryByRole("tooltip")).toBeNull());
  await expect(reasons()).toEqual([
    [true, "trigger-focus"],
    [false, "trigger-press"],
  ]);
});

Default.test("never opens from a touch", async ({ canvas, userEvent }) => {
  await userEvent.pointer({
    keys: "[TouchA]",
    target: canvas.getByRole("button", { name: "Copy link" }),
  });
  // user-event's touch then focuses the Trigger by script, which the :focus-visible heuristics match
  // though a real tap would not, so the proof checks the pointer path only:
  // https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo
  await expect(reasons()).not.toContainEqual([true, "trigger-hover"]);
});

Default.test("stays hidden after its Trigger is clicked", async ({ canvas }) => {
  const user = await trusted();

  await user.click(canvas.getByRole("button", { name: "Copy link" }));
  await expect(canvas.queryByRole("tooltip")).toBeNull();
});

Default.test(
  "keeps the Tooltip on a disabled Trigger, which explains why",
  {
    args: {
      children: (
        <>
          <Tooltip.Trigger asChild>
            <Button disabled>Publish</Button>
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">Add a title before publishing</Tooltip.Content>
        </>
      ),
    },
  },
  async ({ canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Publish" });

    await expect(trigger).toHaveAccessibleDescription("Add a title before publishing");
    await user.keyboard("{Tab}");
    await expect(canvas.getByRole("tooltip")).toBeVisible();
  },
);

Default.test("adds nothing when disabled", { args: { disabled: true } }, async ({ canvas }) => {
  const user = await trusted();
  const trigger = canvas.getByRole("button", { name: "Copy link" });

  await expect(trigger).not.toHaveAccessibleDescription();
  await user.keyboard("{Tab}");
  await expect(canvas.queryByRole("tooltip")).toBeNull();
});

Default.test(
  "keeps the Tooltip closed when onOpenChange cancels",
  {
    args: {
      onOpenChange: (_open: boolean, details: Tooltip.ChangeEventDetails) => {
        details.cancel();
      },
    },
  },
  async ({ canvas }) => {
    const user = await trusted();

    await user.keyboard("{Tab}");
    await expect(canvas.queryByRole("tooltip")).toBeNull();
  },
);

export const Neighbours = meta.story({
  parameters: {
    docs: {
      description: {
        story:
          "Moving from one Tooltip to the next within 400 ms shows the next one at once; only one Tooltip shows at a time.",
      },
    },
  },
  render: (args) => (
    <>
      <Tooltip.Root {...args}>
        <Tooltip.Trigger asChild>
          <IconButton aria-label="Pin">
            <PinIcon />
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Content>Pin</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root {...args} />
    </>
  ),
});

Neighbours.test(
  "hides when its Trigger loses focus, so one shows at a time",
  async ({ canvas }) => {
    const user = await trusted();

    await user.keyboard("{Tab}");
    await expect(canvas.getByRole("tooltip")).toHaveTextContent("Pin");
    await user.keyboard("{Tab}");
    await waitFor(() => expect(canvas.getByRole("tooltip")).toHaveTextContent(/^Copy link/v));
    await expect(reasons()).toEqual([
      [true, "trigger-focus"],
      [false, "trigger-focus"],
      [true, "trigger-focus"],
    ]);
  },
);

Neighbours.test("shows the neighbour at once while warm", async ({ canvas }) => {
  const user = await trusted();

  await user.hover(canvas.getByRole("button", { name: "Pin" }));
  await waitFor(() => expect(canvas.getByRole("tooltip")).toBeVisible());
  await user.hover(canvas.getByRole("button", { name: "Copy link" }));
  await expect(canvas.getByRole("tooltip")).toBeVisible();
  await expect(canvas.getByRole("tooltip")).toHaveTextContent(/^Copy link/v);
});
