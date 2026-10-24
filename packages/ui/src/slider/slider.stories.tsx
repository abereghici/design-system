import { expect, fn } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import * as Slider from "./slider.tsx";

const volume = (
  <>
    <Slider.Track data-testid="track">
      <Slider.Range />
      <Slider.Thumb aria-label="Volume" />
    </Slider.Track>
    <Slider.Value />
  </>
);

const price = (
  <>
    <Slider.Track>
      <Slider.Range />
      <Slider.Thumb aria-label="Minimum price" />
      <Slider.Thumb aria-label="Maximum price" />
    </Slider.Track>
    <Slider.Value />
  </>
);

const meta = preview.meta({
  title: "Components/Forms/Slider",
  component: Slider.Root,
  args: {
    defaultValue: 40,
    children: volume,
    onValueChange: fn<(value: number | number[], details: Slider.ChangeEventDetails) => void>(),
    onValueCommitted: fn<(value: number | number[], details: Slider.CommitEventDetails) => void>(),
  },
  decorators: [(Story) => <div style={{ inlineSize: 320 }}>{Story()}</div>],
});

export const Default = meta.story({});

Default.test("is a slider with its formatted value", async ({ canvas }) => {
  const slider = canvas.getByRole("slider", { name: "Volume" });
  await expect(slider).toHaveValue("40");
  await expect(slider).toHaveAttribute("aria-valuetext", "40");
  await expect(canvas.getByRole("status")).toHaveTextContent("40");
});

Default.test(
  "steps with the arrow keys and commits each step",
  async ({ canvas, userEvent, args }) => {
    const slider = canvas.getByRole("slider", { name: "Volume" });
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowUp}{ArrowDown}");
    await expect(slider).toHaveValue("41");
    await expect(args.onValueChange).toHaveBeenNthCalledWith(
      1,
      41,
      expect.objectContaining({ reason: "keyboard" }),
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(3);
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(41, expect.anything());
  },
);

Default.test(
  "takes large steps with Page Up, Page Down and Shift, and jumps with Home and End",
  async ({ canvas, userEvent }) => {
    const slider = canvas.getByRole("slider", { name: "Volume" });
    await userEvent.tab();
    await userEvent.keyboard("{PageUp}");
    await expect(slider).toHaveValue("50");
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}{PageDown}");
    await expect(slider).toHaveValue("30");
    await userEvent.keyboard("{End}");
    await expect(slider).toHaveValue("100");
    await userEvent.keyboard("{Home}");
    await expect(slider).toHaveValue("0");
  },
);

Default.test(
  "follows the visual direction with Left and Right in RTL",
  { globals: { dir: "rtl" } },
  async ({ canvas, userEvent }) => {
    const slider = canvas.getByRole("slider", { name: "Volume" });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(slider).toHaveValue("41");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(slider).toHaveValue("39");
  },
);

Default.test(
  "moves to a pressed point on the track and commits on release",
  async ({ canvas, userEvent, args }) => {
    const slider = canvas.getByRole("slider", { name: "Volume" });
    const track = canvas.getByTestId("track");
    const rect = track.getBoundingClientRect();
    await userEvent.pointer({
      keys: "[MouseLeft]",
      target: track,
      coords: { clientX: rect.left + rect.width * 0.75, clientY: rect.top + rect.height / 2 },
    });
    await expect(slider).toHaveValue("75");
    await expect(slider).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      75,
      expect.objectContaining({ reason: "track-press" }),
    );
    await expect(args.onValueCommitted).toHaveBeenCalledOnce();
    await expect(args.onValueCommitted).toHaveBeenCalledWith(75, expect.anything());
  },
);

Default.test("follows a drag and commits once", async ({ canvas, userEvent, args }) => {
  const track = canvas.getByTestId("track");
  const rect = track.getBoundingClientRect();
  const at = (fraction: number) => ({
    clientX: rect.left + rect.width * fraction,
    clientY: rect.top + rect.height / 2,
  });
  await userEvent.pointer([
    { keys: "[MouseLeft>]", target: track, coords: at(0.25) },
    { target: track, coords: at(0.6) },
    { keys: "[/MouseLeft]", target: track, coords: at(0.6) },
  ]);
  await expect(canvas.getByRole("slider", { name: "Volume" })).toHaveValue("60");
  await expect(args.onValueChange).toHaveBeenLastCalledWith(
    60,
    expect.objectContaining({ reason: "drag" }),
  );
  await expect(args.onValueCommitted).toHaveBeenCalledOnce();
  await expect(args.onValueCommitted).toHaveBeenCalledWith(
    60,
    expect.objectContaining({ reason: "drag" }),
  );
});

Default.test(
  "keeps its value when the change is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent, args }) => {
    const slider = canvas.getByRole("slider", { name: "Volume" });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(slider).toHaveValue("40");
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
);

Default.test(
  "stays focusable and keeps its value when disabled",
  { args: { disabled: true } },
  async ({ canvas, userEvent, args }) => {
    const slider = canvas.getByRole("slider", { name: "Volume" });
    await expect(slider).toHaveAttribute("aria-disabled", "true");
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{End}");
    await expect(slider).toHaveValue("40");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);

Default.test(
  "gives a range two named thumbs that can't cross, formatted in the value",
  {
    args: {
      defaultValue: [20, 80],
      max: 200,
      step: 5,
      minStepsBetweenValues: 2,
      format: { style: "currency", currency: "EUR" },
      children: price,
    },
  },
  async ({ canvas, userEvent, args }) => {
    const low = canvas.getByRole("slider", { name: "Minimum price" });
    await expect(low).toHaveAttribute("aria-valuetext", "€20.00");
    await expect(canvas.getByRole("status")).toHaveTextContent("€20.00–€80.00");
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect(low).toHaveValue("70");
    await expect(args.onValueChange).toHaveBeenLastCalledWith([70, 80], expect.anything());
    await userEvent.tab();
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("slider", { name: "Maximum price" })).toHaveValue("80");
  },
);

Default.test(
  "submits one entry per thumb",
  {
    args: { name: "price", defaultValue: [20, 80], children: price },
    decorators: [(Story) => <form aria-label="Filters">{Story()}</form>],
  },
  async ({ canvas }) => {
    const form = canvas.getByRole<HTMLFormElement>("form", { name: "Filters" });
    await expect([...new FormData(form)]).toEqual([
      ["price", "20"],
      ["price", "80"],
    ]);
  },
);
