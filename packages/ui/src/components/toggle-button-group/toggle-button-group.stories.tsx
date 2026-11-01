import { expect, fn } from "storybook/test";

import { ToggleButton } from "@abereghici/ui/toggle-button";

import { withToolbar } from "#.storybook/decorators/with-toolbar.tsx";
import preview from "#.storybook/preview.tsx";

import { ToggleButtonGroup } from "./toggle-button-group.tsx";
import type { ToggleButtonGroupChangeEventDetails } from "./toggle-button-group.tsx";

const styles = (
  <>
    <ToggleButton value="bold">Bold</ToggleButton>
    <ToggleButton value="italic">Italic</ToggleButton>
    <ToggleButton value="underline">Underline</ToggleButton>
  </>
);

const meta = preview.meta({
  title: "Components/ToggleButtonGroup",
  component: ToggleButtonGroup,
  args: { "aria-label": "Text style", children: styles },
});

export const Default = meta.story({
  args: {
    selectionMode: "multiple",
    defaultValue: ["bold"],
    onValueChange: fn<(value: string[], details: ToggleButtonGroupChangeEventDetails) => void>(),
  },
});

Default.test(
  "is a named group whose buttons each report their own pressed state",
  async ({ canvas, userEvent, args }) => {
    const group = canvas.getByRole("group", { name: "Text style" });
    const italic = canvas.getByRole("button", { name: "Italic" });

    await expect(group).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(italic);
    await expect(italic).toHaveAttribute("aria-pressed", "true");
    await expect(args.onValueChange).toHaveBeenCalledWith(
      ["bold", "italic"],
      expect.objectContaining({ reason: "none" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Bold" }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["italic"], expect.anything());
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  },
);

Default.test("gives each button its own Tab stop", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: "Bold" })).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: "Italic" })).toHaveFocus();
});

Default.test(
  "keeps the pressed buttons when the change is cancelled",
  {
    args: {
      onValueChange: (_value: string[], details: ToggleButtonGroupChangeEventDetails) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Italic" }));
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  },
);

export const SingleSelection = meta.story({
  args: {
    "aria-label": "Alignment",
    selectionMode: "single",
    defaultValue: "start",
    children: (
      <>
        <ToggleButton value="start">Start</ToggleButton>
        <ToggleButton value="center">Center</ToggleButton>
        <ToggleButton value="end">End</ToggleButton>
      </>
    ),
    onValueChange: fn<(value: string, details: ToggleButtonGroupChangeEventDetails) => void>(),
  },
  parameters: {
    docs: {
      description: { story: 'With `selectionMode="single"` one button is pressed at a time.' },
    },
  },
});

SingleSelection.test(
  "presses one button at a time, and lets the pressed one turn off",
  async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Center" }));
    await expect(canvas.getByRole("button", { name: "Start" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(canvas.getByRole("button", { name: "Center" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(args.onValueChange).toHaveBeenCalledWith("center", expect.anything());
    await userEvent.click(canvas.getByRole("button", { name: "Center" }));
    await expect(canvas.getByRole("button", { name: "Center" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(args.onValueChange).toHaveBeenLastCalledWith("", expect.anything());
  },
);

export const InAToolbar = meta.story({
  args: { selectionMode: "multiple", defaultValue: ["bold"] },
  decorators: [withToolbar("Formatting")],
  parameters: {
    docs: {
      description: {
        story: "Inside a Toolbar, the Toolbar's arrow keys move between the buttons.",
      },
    },
  },
});

InAToolbar.test(
  "moves between the buttons with the Toolbar's arrow keys, in one Tab stop",
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("button", { name: "Italic" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.tab();
    await expect(document.body).toHaveFocus();
  },
);
