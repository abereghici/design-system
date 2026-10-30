import { useState } from "react";
import { expect, fn, spyOn } from "storybook/test";
import { Temporal } from "temporal-polyfill";

import preview from "#.storybook/preview.tsx";

import { Calendar } from "./calendar.tsx";
import type { CalendarChangeEventDetails, CalendarProps } from "./calendar.tsx";

const names = { previousMonthLabel: "Previous month", nextMonthLabel: "Next month" };

// @ts-expect-error -- the month buttons show only icons, so they need names
({}) satisfies CalendarProps;
// @ts-expect-error -- a Calendar has nothing to disable or submit
({ ...names, disabled: true }) satisfies CalendarProps;
// @ts-expect-error -- a Calendar has nothing to disable or submit
({ ...names, name: "day", form: "booking" }) satisfies CalendarProps;

const date = (iso: string) => Temporal.PlainDate.from(iso);

function NarrowingMax(args: CalendarProps) {
  const [max, setMax] = useState<Temporal.PlainDate>();

  return (
    <>
      <Calendar {...args} max={max} />
      <button
        type="button"
        onClick={() => {
          setMax(date("2026-09-15"));
        }}
      >
        Book by September 15
      </button>
    </>
  );
}

const meta = preview.meta({
  title: "Components/Calendar",
  component: Calendar,
  args: {
    "aria-label": "Delivery date",
    ...names,
    defaultValue: date("2026-10-24"),
    onValueChange: fn<(value: Temporal.PlainDate, details: CalendarChangeEventDetails) => void>(),
  },
  // Today is marked in the grid, so screenshots and the today proof need a fixed date.
  beforeEach() {
    const today = spyOn(Temporal.Now, "plainDateISO").mockReturnValue(date("2026-10-25"));

    return () => {
      today.mockRestore();
    };
  },
});

export const Default = meta.story({});

Default.test("names the grid by its month and selects the value", async ({ canvas }) => {
  await expect(canvas.getByRole("group", { name: "Delivery date" })).toBeVisible();

  const grid = canvas.getByRole("grid", { name: "October 2026" });

  await expect(grid).toBeVisible();
  await expect(canvas.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);
  await expect(canvas.getByLabelText("Saturday, October 24, 2026")).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

Default.test("tabs through Previous, Next and the selected day", async ({ canvas, userEvent }) => {
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: "Previous month" })).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByRole("button", { name: "Next month" })).toHaveFocus();
  await userEvent.tab();
  await expect(canvas.getByLabelText("Saturday, October 24, 2026")).toHaveFocus();
});

Default.test(
  "moves the focused day with the arrow, Home, End and Page keys",
  async ({ canvas, userEvent }) => {
    const cell = (name: string) => canvas.getByLabelText(name);

    cell("Saturday, October 24, 2026").focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(cell("Friday, October 23, 2026")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(cell("Sunday, October 18, 2026")).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(cell("Saturday, October 24, 2026")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(cell("Saturday, November 7, 2026")).toHaveFocus();
    await expect(canvas.getByRole("heading", { name: "November 2026" })).toBeVisible();
    await userEvent.keyboard("{PageUp}");
    await expect(cell("Wednesday, October 7, 2026")).toHaveFocus();
    await userEvent.keyboard("{Shift>}{PageDown}{/Shift}");
    await expect(cell("Thursday, October 7, 2027")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}{ArrowRight}");
    await expect(cell("Friday, October 1, 2027")).toHaveFocus();
  },
);

Default.test(
  "takes the last day of a shorter month on Page Down",
  { args: { defaultValue: date("2026-01-31") } },
  async ({ canvas, userEvent }) => {
    canvas.getByLabelText("Saturday, January 31, 2026").focus();
    await userEvent.keyboard("{PageDown}");
    await expect(canvas.getByLabelText("Saturday, February 28, 2026")).toHaveFocus();
  },
);

Default.test(
  "swaps Left and Right in RTL",
  { globals: { dir: "rtl" } },
  async ({ canvas, userEvent }) => {
    canvas.getByLabelText("Saturday, October 24, 2026").focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByLabelText("Sunday, October 25, 2026")).toHaveFocus();
  },
);

Default.test("chooses a day on click and on Enter", async ({ args, canvas, userEvent }) => {
  await userEvent.click(canvas.getByLabelText("Monday, October 12, 2026"));
  await expect(args.onValueChange).toHaveBeenLastCalledWith(
    date("2026-10-12"),
    expect.objectContaining({ reason: "day-press" }),
  );
  await expect(canvas.getByLabelText("Monday, October 12, 2026")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await userEvent.keyboard("{ArrowRight}{Enter}");
  await expect(args.onValueChange).toHaveBeenLastCalledWith(date("2026-10-13"), expect.anything());
});

Default.test(
  "pages months with Previous and Next, keeping focus on the button",
  async ({ canvas, userEvent }) => {
    const next = canvas.getByRole("button", { name: "Next month" });

    await userEvent.click(next);
    await expect(canvas.getByRole("grid", { name: "November 2026" })).toBeVisible();
    await expect(next).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Previous month" }));
    await userEvent.click(canvas.getByRole("button", { name: "Previous month" }));
    await expect(canvas.getByRole("heading", { name: "September 2026" })).toBeVisible();
  },
);

Default.test(
  "stops at min and max, and refuses unavailable days",
  {
    args: {
      min: date("2026-10-05"),
      max: date("2026-10-28"),
      isDateUnavailable: (day: Temporal.PlainDate) => day.dayOfWeek > 5,
    },
  },
  async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("button", { name: "Previous month" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    const sunday = canvas.getByLabelText("Sunday, October 4, 2026");

    await expect(sunday).toHaveAttribute("aria-disabled", "true");
    canvas.getByLabelText("Monday, October 5, 2026").focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByLabelText("Monday, October 5, 2026")).toHaveFocus();
    await userEvent.click(canvas.getByLabelText("Saturday, October 10, 2026"));
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);

Default.test(
  "moves into the range when max changes to before the shown month",
  { render: NarrowingMax },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Book by September 15" }));
    await expect(canvas.getByRole("grid", { name: "September 2026" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Previous month" })).not.toHaveAttribute(
      "aria-disabled",
    );
  },
);

Default.test(
  "keeps the value when the change is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByLabelText("Monday, October 12, 2026"));
    await expect(canvas.getByLabelText("Saturday, October 24, 2026")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
);

Default.test("marks today", { args: { defaultValue: null } }, async ({ canvas }) => {
  await expect(canvas.getByLabelText("Sunday, October 25, 2026")).toHaveAttribute(
    "aria-current",
    "date",
  );
});

Default.test(
  "starts the week on Monday for ro-RO, in Romanian",
  { globals: { locale: "ro-RO" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("grid", { name: "octombrie 2026" })).toBeVisible();
    await expect(canvas.getAllByRole("columnheader")[0]).toHaveTextContent("lun.");
  },
);

Default.test(
  "names the Gregorian year for th-TH, whose default calendar is Buddhist",
  { globals: { locale: "th-TH" } },
  async ({ canvas }) => {
    await expect(canvas.getByRole("grid", { name: "ตุลาคม 2026" })).toBeVisible();
  },
);
