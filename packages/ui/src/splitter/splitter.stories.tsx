import { expect, fn } from "storybook/test";

import { withHeight } from "#.storybook/decorators/with-height.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { touchDrag } from "#.storybook/test/pointer.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import * as Splitter from "./splitter.tsx";

// @ts-expect-error -- the handle needs a name
({}) satisfies Splitter.HandleProps;

// @ts-expect-error -- either the app holds the size or the Splitter does, not both
({ value: 40, defaultValue: 30 }) satisfies Splitter.RootProps;

const inset = { padding: "var(--ab-space-inset-md)" };

const meta = preview.meta({
  title: "Components/Splitter",
  component: Splitter.Root,
  subcomponents: partsOf(Splitter),
  args: {
    defaultValue: 30,
    children: (
      <>
        <Splitter.Panel style={inset}>Folders</Splitter.Panel>
        <Splitter.Handle aria-label="Resize folders" />
        <Splitter.Panel style={inset}>Preview</Splitter.Panel>
      </>
    ),
    onValueChange: fn<(value: number, details: Splitter.ChangeEventDetails) => void>(),
  },
  decorators: [withHeight("12rem")],
});

export const Default = meta.story({});

Default.test(
  "announces its position, its range and the panel it resizes",
  { args: { min: 20, max: 80 } },
  async ({ canvas }) => {
    const handle = canvas.getByRole("separator", { name: "Resize folders" });

    await expect(handle).toHaveAttribute("aria-valuenow", "30");
    await expect(handle).toHaveAttribute("aria-valuetext", "30%");
    await expect(handle).toHaveAttribute("aria-valuemin", "20");
    await expect(handle).toHaveAttribute("aria-valuemax", "80");
    await expect(handle.ariaControlsElements).toEqual([canvas.getByText("Folders")]);
  },
);

Default.test(
  "moves with the arrow keys, and to the ends with Home and End",
  async ({ canvas, userEvent, args }) => {
    const handle = canvas.getByRole("separator", { name: "Resize folders" });

    await userEvent.tab();
    await expect(handle).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowLeft}{ArrowLeft}");
    await expect(handle).toHaveAttribute("aria-valuenow", "29");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      29,
      expect.objectContaining({ reason: "keyboard" }),
    );
    await userEvent.keyboard("{End}");
    await expect(handle).toHaveAttribute("aria-valuenow", "100");
    await userEvent.keyboard("{Home}");
    await expect(handle).toHaveAttribute("aria-valuenow", "0");
  },
);

Default.test(
  "follows the visual direction with Left and Right in RTL",
  { globals: { dir: "rtl" } },
  async ({ canvas, userEvent }) => {
    const handle = canvas.getByRole("separator", { name: "Resize folders" });

    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(handle).toHaveAttribute("aria-valuenow", "31");
  },
);

Default.test(
  "moves with Up and Down when the panels are stacked",
  { args: { orientation: "vertical" } },
  async ({ canvas, userEvent }) => {
    const handle = canvas.getByRole("separator", { name: "Resize folders" });

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}{ArrowRight}");
    await expect(handle).toHaveAttribute("aria-valuenow", "31");
  },
);

Default.test(
  "collapses the first panel with Enter, restores it with Enter again, and dispatches ab-toggle",
  async ({ canvas, userEvent }) => {
    const handle = canvas.getByRole("separator", { name: "Resize folders" });
    const toggles = listen("ab-toggle");

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(handle).toHaveAttribute("aria-valuenow", "0");
    await expect(canvas.getByText("Folders")).not.toBeVisible();
    await userEvent.keyboard("{Enter}");
    toggles.stop();
    await expect(handle).toHaveAttribute("aria-valuenow", "30");
    await expect(canvas.getByText("Folders")).toBeVisible();
    await expect(toggles.events.map(({ target, detail }) => ({ target, detail }))).toEqual(
      Array.from({ length: 2 }, () => ({
        target: handle,
        detail: { component: "Splitter", reason: "user" },
      })),
    );
  },
);

Default.test(
  "keeps its size, and dispatches nothing, when the change is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const handle = canvas.getByRole("separator", { name: "Resize folders" });
    const toggles = listen("ab-toggle");

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    toggles.stop();
    await expect(handle).toHaveAttribute("aria-valuenow", "30");
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "stays at the size the app holds",
  { args: { value: 40 } },
  async ({ canvas, userEvent, args }) => {
    const handle = canvas.getByRole("separator", { name: "Resize folders" });

    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(handle).toHaveAttribute("aria-valuenow", "40");
    await expect(args.onValueChange).toHaveBeenCalledWith(41, expect.anything());
  },
);

Default.test(
  "follows a drag that leaves the handle, up to the largest size",
  { args: { max: 80 } },
  async ({ canvas, args }) => {
    const user = await trusted();
    const handle = canvas.getByRole("separator", { name: "Resize folders" });
    const pane = canvas.getByText("Preview");

    await user.dragAndDrop(handle, pane, {
      targetPosition: { x: pane.clientWidth - 1, y: 1 },
    });
    await expect(handle).toHaveAttribute("aria-valuenow", "80");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      80,
      expect.objectContaining({ reason: "drag" }),
    );
  },
);

Default.test(
  "follows a finger to the end of its drag, in a page that could scroll",
  { args: { orientation: "vertical" }, decorators: [withHeight("200vh")] },
  async ({ canvas }) => {
    const handle = canvas.getByRole("separator", { name: "Resize folders" });
    const start = handle.getBoundingClientRect().top;

    await touchDrag(handle, 0, 80);
    await expect(handle.getBoundingClientRect().top - start).toBeCloseTo(80, 0);
  },
);

export const Nested = meta.story({
  args: {
    children: (
      <>
        <Splitter.Panel style={inset}>Folders</Splitter.Panel>
        <Splitter.Handle aria-label="Resize folders" />
        <Splitter.Panel>
          <Splitter.Root orientation="vertical" defaultValue={70}>
            <Splitter.Panel style={inset}>Editor</Splitter.Panel>
            <Splitter.Handle aria-label="Resize editor" />
            <Splitter.Panel style={inset}>Terminal</Splitter.Panel>
          </Splitter.Root>
        </Splitter.Panel>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "A vertical Splitter in a panel, as in an editor with a terminal below.",
      },
    },
  },
});

Nested.test("moves each handle on its own", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await userEvent.tab();
  await userEvent.keyboard("{ArrowDown}");
  await expect(canvas.getByRole("separator", { name: "Resize editor" })).toHaveAttribute(
    "aria-valuenow",
    "71",
  );
  await expect(canvas.getByRole("separator", { name: "Resize folders" })).toHaveAttribute(
    "aria-valuenow",
    "30",
  );
});
