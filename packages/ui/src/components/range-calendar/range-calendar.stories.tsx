import { expect, fn, spyOn } from "storybook/test";
import { Temporal } from "temporal-polyfill";

import preview from "#.storybook/preview.tsx";

import { RangeCalendar } from "./range-calendar.tsx";
import type { RangeCalendarChangeEventDetails } from "./range-calendar.tsx";

const months = { previousMonthLabel: "Previous month", nextMonthLabel: "Next month" };
const date = (iso: string) => Temporal.PlainDate.from(iso);
const range = (start: string, end: string) => ({ start: date(start), end: date(end) });

// Testing Library reads a grid's cells as "cell", which has no selected state; Playwright's role
// engine reads them as gridcells, as browsers do.
async function selectedNumbers() {
  const { page } = await import("vitest/browser");

  return page
    .getByRole("gridcell", { selected: true })
    .elements()
    .map((day) => day.textContent);
}

const meta = preview.meta({
  title: "Components/RangeCalendar",
  component: RangeCalendar,
  args: {
    "aria-label": "Trip dates",
    ...months,
    defaultValue: range("2026-10-12", "2026-10-16"),
    onValueChange:
      fn<
        (
          value: { start: Temporal.PlainDate; end: Temporal.PlainDate },
          details: RangeCalendarChangeEventDetails,
        ) => void
      >(),
  },
  // Today is marked in the grid, so screenshots need a fixed date.
  beforeEach() {
    const today = spyOn(Temporal.Now, "plainDateISO").mockReturnValue(date("2026-10-25"));

    return () => {
      today.mockRestore();
    };
  },
});

export const Default = meta.story({});

Default.test("selects every day of the range", async () => {
  await expect(await selectedNumbers()).toEqual(["12", "13", "14", "15", "16"]);
});

Default.test(
  "chooses a range with two presses, in either order",
  async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByLabelText("Tuesday, October 20, 2026"));
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByLabelText("Sunday, October 18, 2026"));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      range("2026-10-18", "2026-10-20"),
      expect.objectContaining({ reason: "day-press" }),
    );
    await expect(await selectedNumbers()).toEqual(["18", "19", "20"]);
  },
);

Default.test(
  "chooses a range from the keyboard, showing it while the end moves",
  async ({ args, canvas, userEvent }) => {
    canvas.getByLabelText("Monday, October 12, 2026").focus();
    await userEvent.keyboard("{ArrowDown}{Enter}{ArrowRight}{ArrowRight}");
    await expect(await selectedNumbers()).toEqual(["19", "20", "21"]);
    await userEvent.keyboard("{Enter}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      range("2026-10-19", "2026-10-21"),
      expect.anything(),
    );
  },
);

Default.test(
  "keeps the range when the change is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByLabelText("Saturday, October 3, 2026"));
    await userEvent.click(canvas.getByLabelText("Monday, October 5, 2026"));
    await expect(await selectedNumbers()).toEqual(["12", "13", "14", "15", "16"]);
  },
);

Default.test(
  "starts the week on Monday for ro-RO",
  { globals: { locale: "ro-RO" } },
  async ({ canvas }) => {
    await expect(canvas.getAllByRole("columnheader")[0]).toHaveTextContent("lun.");
  },
);
