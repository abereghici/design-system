import { useState } from "react";
import { expect } from "storybook/test";

import { Button } from "@platform/ui/button";
import { IconButton } from "@platform/ui/icon-button";
import { CopyIcon } from "@platform/ui/icons/copy";
import { DownloadIcon } from "@platform/ui/icons/download";
import { PinIcon } from "@platform/ui/icons/pin";
import { Separator } from "@platform/ui/separator";

import preview from "#.storybook/preview.tsx";

import { Toolbar } from "./toolbar.tsx";

const controls = (
  <>
    <IconButton aria-label="Pin" defaultPressed={false}>
      <PinIcon />
    </IconButton>
    <IconButton aria-label="Copy link">
      <CopyIcon />
    </IconButton>
    <IconButton aria-label="Download" disabled>
      <DownloadIcon />
    </IconButton>
    <Separator orientation="vertical" />
    <Button variant="tertiary" size="sm">
      Share
    </Button>
  </>
);

function Growing() {
  const [extra, setExtra] = useState(false);
  return (
    <Toolbar aria-label="Report">
      <IconButton
        aria-label="Copy link"
        onClick={() => {
          setExtra(true);
        }}
      >
        <CopyIcon />
      </IconButton>
      <IconButton aria-label="Pin">
        <PinIcon />
      </IconButton>
      {extra && (
        <IconButton aria-label="Download">
          <DownloadIcon />
        </IconButton>
      )}
    </Toolbar>
  );
}

const meta = preview.meta({
  title: "Components/Toolbar",
  component: Toolbar,
  args: { "aria-label": "Report", children: controls },
  parameters: {
    docs: {
      description: {
        component:
          "Groups three or more related controls (IconButtons, Buttons, a SegmentedControl) into one tab stop; the arrow keys move between them, wrapping at the ends and following the visual direction in RTL. Disabled controls stay reachable. For one or two controls, place them directly; never put text fields, Selects or Sliders inside.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test("is a named toolbar and one tab stop", async ({ canvas, userEvent }) => {
  await expect(canvas.getByRole("toolbar", { name: "Report" })).toBeVisible();
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: "Pin" })).toHaveFocus();
  await userEvent.tab();
  await expect(document.body).toHaveFocus();
});

Default.test(
  "moves with the arrow keys, reaching disabled controls and wrapping",
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Copy link" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("button", { name: "Download" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Share" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Pin" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("button", { name: "Share" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("button", { name: "Download" })).toHaveFocus();
  },
);

Default.test("goes to the ends with Home and End", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await userEvent.keyboard("{End}");
  await expect(canvas.getByRole("button", { name: "Share" })).toHaveFocus();
  await userEvent.keyboard("{Home}");
  await expect(canvas.getByRole("button", { name: "Pin" })).toHaveFocus();
});

Default.test("returns Tab to the control used last", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await userEvent.keyboard("{ArrowRight}");
  await userEvent.tab({ shift: true });
  await expect(document.body).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: "Copy link" })).toHaveFocus();
});

Default.test("keeps each control's own behaviour", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await userEvent.keyboard(" ");
  await expect(canvas.getByRole("button", { name: "Pin" })).toHaveAttribute("aria-pressed", "true");
});

Default.test(
  "swaps Left and Right in RTL",
  { globals: { dir: "rtl" } },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("button", { name: "Copy link" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Pin" })).toHaveFocus();
  },
);

Default.test(
  "moves focus between radios without checking them; Space checks",
  {
    args: {
      children: (
        <>
          <IconButton aria-label="Copy link">
            <CopyIcon />
          </IconButton>
          <label>
            <input type="radio" name="view" value="list" defaultChecked /> List
          </label>
          <label>
            <input type="radio" name="view" value="board" /> Board
          </label>
        </>
      ),
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    const board = canvas.getByRole("radio", { name: "Board" });
    await expect(board).toHaveFocus();
    await expect(canvas.getByRole("radio", { name: "List" })).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(board).toBeChecked();
  },
);

Default.test(
  "includes controls added later in the arrow path",
  { render: () => <Growing /> },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const download = await canvas.findByRole("button", { name: "Download" });
    await userEvent.keyboard("{End}");
    await expect(download).toHaveFocus();
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Download" })).toHaveFocus();
  },
);
