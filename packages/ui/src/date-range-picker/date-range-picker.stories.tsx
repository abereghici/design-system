import { expect, fn, screen, spyOn, waitFor, within } from "storybook/test";
import { Temporal } from "temporal-polyfill";

import { RangeCalendar } from "@abereghici/ui/range-calendar";

import { submitted, withForm } from "#.storybook/decorators/with-form.tsx";
import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { parkPointer, trusted } from "#.storybook/test/trusted.ts";

import * as DateRangePicker from "./date-range-picker.tsx";

const date = (iso: string) => Temporal.PlainDate.from(iso);
const range = (start: string, end: string) => ({ start: date(start), end: date(end) });
const segment = (half: "Start date" | "End date", name: "month" | "day") =>
  within(screen.getByRole("group", { name: half })).getByRole("spinbutton", { name });
const onValueChange = fn<NonNullable<DateRangePicker.RootProps["onValueChange"]>>();

const labels = {
  label: "Trip dates",
  startLabel: "Start date",
  endLabel: "End date",
  triggerLabel: "Choose dates",
  incompleteMessage: "Enter a complete date",
  reversedMessage: "The end date is before the start date",
};

const meta = preview.meta({
  title: "Components/DateRangePicker",
  component: DateRangePicker.Root,
  subcomponents: partsOf(DateRangePicker),
  args: {
    ...labels,
    startName: "checkIn",
    endName: "checkOut",
    defaultValue: range("2026-10-12", "2026-10-16"),
    onValueChange,
    children: (
      <DateRangePicker.Content>
        <RangeCalendar previousMonthLabel="Previous month" nextMonthLabel="Next month" />
      </DateRangePicker.Content>
    ),
  },
  beforeEach: async () => {
    // Today is marked in the grid, so screenshots need a fixed date.
    const today = spyOn(Temporal.Now, "plainDateISO").mockReturnValue(date("2026-10-25"));

    onValueChange.mockClear();
    await parkPointer();

    return () => {
      today.mockRestore();
    };
  },
  decorators: [withForm, withWidth("24rem", "24rem")],
});

export const Default = meta.story({});

Default.test(
  "names the start and end dates, and its trigger describes the range",
  async ({ canvas }) => {
    const field = canvas.getByRole("group", { name: "Trip dates" });

    await expect(field).toBeVisible();
    await expect(canvas.getByRole("group", { name: "Start date" })).toBeVisible();
    await expect(canvas.getByRole("group", { name: "End date" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Choose dates" })).toHaveAccessibleDescription(
      "Monday, October 12 – Friday, October 16, 2026",
    );
  },
);

Default.test(
  "types the start date on into the end date, and reports the range once both are complete",
  { args: { defaultValue: null } },
  async ({ userEvent }) => {
    await userEvent.click(segment("Start date", "month"));
    await userEvent.keyboard("10122026");
    await expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard("10162026");
    await expect(onValueChange).toHaveBeenLastCalledWith(
      range("2026-10-12", "2026-10-16"),
      expect.objectContaining({ reason: "input-change" }),
    );
  },
);

Default.test(
  "chooses a range on its RangeCalendar, then closes and shows it",
  async ({ canvas }) => {
    const user = await trusted();

    await user.click(canvas.getByRole("button", { name: "Choose dates" }));
    await waitFor(() => expect(canvas.getByLabelText("Monday, October 12, 2026")).toHaveFocus());
    await user.click(canvas.getByLabelText("Tuesday, October 20, 2026"));
    await user.click(canvas.getByLabelText("Sunday, October 18, 2026"));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(onValueChange).toHaveBeenLastCalledWith(
      range("2026-10-18", "2026-10-20"),
      expect.objectContaining({ reason: "day-press" }),
    );
    await expect(segment("Start date", "day")).toHaveValue("18");
    await expect(segment("End date", "day")).toHaveValue("20");
  },
);

Default.test(
  "submits both ISO dates, and returns to its default value when its form resets",
  async ({ canvas, userEvent }) => {
    const end = segment("End date", "day");

    await userEvent.type(end, "20");
    await expect(end).toHaveValue("20");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(end).toHaveValue("16");
    submitted.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));

    const data = submitted.mock.calls[0]?.[0];

    await expect([data?.get("checkIn"), data?.get("checkOut")]).toEqual([
      "2026-10-12",
      "2026-10-16",
    ]);
  },
);

Default.test("marks an end date before the start date invalid", async ({ canvas }) => {
  const user = await trusted();

  await user.click(segment("End date", "day"));
  await user.keyboard("05{Tab}");
  await expect(await canvas.findByText("The end date is before the start date")).toBeVisible();
});
