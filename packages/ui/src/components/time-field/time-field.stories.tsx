import { expect, fn, screen } from "storybook/test";
import { Temporal } from "temporal-polyfill";

import { submitted, withForm } from "#.storybook/decorators/with-form.tsx";
import preview from "#.storybook/preview.tsx";

import { TimeField } from "./time-field.tsx";
import type { TimeFieldChangeEventDetails } from "./time-field.tsx";

const time = (iso: string) => Temporal.PlainTime.from(iso);
const named = (...names: string[]) => names.map((name) => screen.getByRole("spinbutton", { name }));

const meta = preview.meta({
  title: "Components/TimeField",
  component: TimeField,
  args: {
    label: "Start time",
    name: "start",
    incompleteMessage: "Enter a complete time",
    placeholders: { hour: "hh", minute: "mm", dayPeriod: "--" },
    onValueChange:
      fn<(value: Temporal.PlainTime | null, details: TimeFieldChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test("shows en-US time in 12 hours, with the day period last", async ({ canvas }) => {
  await expect(screen.getAllByRole("spinbutton")).toEqual(named("hour", "minute", "AM/PM"));
  await expect(canvas.getByRole("spinbutton", { name: "hour" })).toHaveAttribute(
    "aria-valuemax",
    "12",
  );
});

Default.test(
  "types a time segment by segment and reports it",
  async ({ args, canvas, userEvent }) => {
    const period = canvas.getByRole("spinbutton", { name: "AM/PM" });

    await userEvent.click(canvas.getByRole("spinbutton", { name: "hour" }));
    await userEvent.keyboard("9");
    await expect(canvas.getByRole("spinbutton", { name: "minute" })).toHaveFocus();
    await userEvent.keyboard("30");
    await expect(period).toHaveFocus();
    await userEvent.keyboard("p");
    await expect(period).toHaveValue("PM");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      time("21:30"),
      expect.objectContaining({ reason: "input-change" }),
    );
  },
);

Default.test(
  "switches the day period with the arrow keys",
  { args: { defaultValue: time("11:45") } },
  async ({ args, canvas, userEvent }) => {
    const period = canvas.getByRole("spinbutton", { name: "AM/PM" });

    await expect(period).toHaveAttribute("aria-valuetext", "AM");
    await userEvent.click(period);
    await userEvent.keyboard("{ArrowUp}");
    await expect(period).toHaveAttribute("aria-valuetext", "PM");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      time("23:45"),
      expect.objectContaining({ reason: "keyboard" }),
    );
  },
);

Default.test(
  "shows ro-RO time in 24 hours, and types midnight",
  { globals: { locale: "ro-RO" }, args: { label: "Ora de început" } },
  async ({ args, canvas, userEvent }) => {
    const hour = canvas.getByRole("spinbutton", { name: "oră" });

    await expect(screen.getAllByRole("spinbutton")).toEqual(named("oră", "minut"));
    await expect(hour).toHaveAttribute("aria-valuemax", "23");
    await userEvent.click(hour);
    await userEvent.keyboard("0005");
    await expect(hour).toHaveValue("00");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(time("00:05"), expect.anything());
  },
);

export const InAForm = meta.story({
  decorators: [withForm],
  args: { required: true, defaultValue: time("09:15") },
});

InAForm.test(
  "submits the ISO time, and restores its default value when the form resets",
  async ({ canvas, userEvent }) => {
    const hour = canvas.getByRole("spinbutton", { name: "hour" });

    await userEvent.click(hour);
    await userEvent.keyboard("{ArrowUp}");
    submitted.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(submitted.mock.calls[0]?.[0].get("start")).toBe("10:15");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(hour).toHaveValue("09");
    submitted.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(submitted.mock.calls[0]?.[0].get("start")).toBe("09:15");
  },
);
