import { expect, fn } from "storybook/test";

import { MoonIcon } from "@abereghici/ui/icons/moon";
import { SunIcon } from "@abereghici/ui/icons/sun";
import { Toolbar } from "@abereghici/ui/toolbar";

import { withForm } from "#.storybook/decorators/with-form.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";

import { SegmentedControl } from "./index.ts";

const meta = preview.meta({
  title: "Components/SegmentedControl",
  component: SegmentedControl.Root,
  subcomponents: partsOf(SegmentedControl),
  args: {
    "aria-label": "View",
    defaultValue: "list",
    children: (
      <>
        <SegmentedControl.Item value="list">List</SegmentedControl.Item>
        <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
        <SegmentedControl.Item value="calendar">Calendar</SegmentedControl.Item>
      </>
    ),
    onValueChange: fn<(value: string, details: SegmentedControl.ChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test(
  "submits the chosen view under its name, and returns to its default when its form resets",
  { args: { name: "view" }, decorators: [withForm] },
  async ({ args, canvas, userEvent }) => {
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Profile" });
    const board = canvas.getByRole("radio", { name: "Board" });

    await userEvent.click(board);
    await expect([...new FormData(form)]).toEqual([["view", "board"]]);
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(canvas.getByRole("radio", { name: "List" })).toBeChecked();
    await userEvent.click(board);
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
  },
);

Default.test(
  "chooses a view on click and dispatches one ab-toggle",
  async ({ canvas, userEvent, args }) => {
    const board = canvas.getByRole("radio", { name: "Board" });
    const toggles = listen("ab-toggle");

    await userEvent.click(canvas.getByText("Board"));
    await userEvent.click(board);
    toggles.stop();
    await expect(board).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "List" })).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      "board",
      expect.objectContaining({ reason: "none" }),
    );
    await expect(toggles.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: board, detail: { component: "SegmentedControl", reason: "user" } },
    ]);
  },
);

Default.test(
  "enters at the checked view and chooses with the arrow keys",
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("radio", { name: "List" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "Board" })).toBeChecked();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");

    const calendar = canvas.getByRole("radio", { name: "Calendar" });

    await expect(calendar).toHaveFocus();
    await expect(calendar).toBeChecked();
  },
);

Default.test(
  "follows the visual direction with Left and Right in RTL",
  { globals: { dir: "rtl" } },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("radio", { name: "Board" })).toBeChecked();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(canvas.getByRole("radio", { name: "Calendar" })).toHaveFocus();
  },
);

Default.test(
  "keeps the previous choice when the change is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const toggles = listen("ab-toggle");

    await userEvent.click(canvas.getByRole("radio", { name: "Board" }));
    toggles.stop();
    await expect(canvas.getByRole("radio", { name: "List" })).toBeChecked();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "follows a controlled value",
  { args: { value: "calendar" } },
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Board" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("board", expect.anything());
    await expect(canvas.getByRole("radio", { name: "Calendar" })).toBeChecked();
  },
);

Default.test(
  "keeps its value and reports no change when a click is default-prevented",
  async ({ canvas, userEvent, args }) => {
    const board = canvas.getByRole("radio", { name: "Board" });

    board.addEventListener("click", (event) => {
      event.preventDefault();
    });

    const toggles = listen("ab-toggle");

    await userEvent.click(board);
    toggles.stop();
    await expect(canvas.getByRole("radio", { name: "List" })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(toggles.events).toEqual([]);
  },
);

Default.test(
  "leaves the arrow keys to an enclosing Toolbar in RTL",
  {
    globals: { dir: "rtl" },
    decorators: [
      (Story) => (
        <Toolbar aria-label="Board tools">
          <Story />
        </Toolbar>
      ),
    ],
  },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("radio", { name: "Board" })).toHaveFocus();
    await expect(canvas.getByRole("radio", { name: "List" })).toBeChecked();
  },
);

export const IconOnly = meta.story({
  args: {
    "aria-label": "Theme",
    defaultValue: "light",
    children: (
      <>
        <SegmentedControl.Item value="light" aria-label="Light">
          <SunIcon />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="dark" aria-label="Dark">
          <MoonIcon />
        </SegmentedControl.Item>
      </>
    ),
  },
  parameters: {
    docs: { description: { story: "Icon-only items name their radio with `aria-label`." } },
  },
});

IconOnly.test("names each icon-only view by its aria-label", async ({ canvas }) => {
  await expect(canvas.getByRole("radio", { name: "Light" })).toBeChecked();
  await expect(canvas.getByRole("radio", { name: "Dark" })).not.toBeChecked();
});
