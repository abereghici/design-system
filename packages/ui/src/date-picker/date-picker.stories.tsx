import { lazy, Suspense } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { Temporal } from "temporal-polyfill";

import { Calendar } from "@abereghici/ui/calendar";

import { submitted, withForm } from "#.storybook/decorators/with-form.tsx";
import { dateFieldArgTypes } from "#.storybook/docs/arg-types.ts";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { parkPointer, trusted } from "#.storybook/test/trusted.ts";

import * as DatePicker from "./date-picker.tsx";

const date = (iso: string) => Temporal.PlainDate.from(iso);
const onOpenChange = fn<NonNullable<DatePicker.RootProps["onOpenChange"]>>();
const onValueChange = fn<NonNullable<DatePicker.RootProps["onValueChange"]>>();
const reasons = () => onOpenChange.mock.calls.map(([open, { reason }]) => [open, reason]);

const months = { previousMonthLabel: "Previous month", nextMonthLabel: "Next month" };

// @ts-expect-error -- the calendar button shows only an icon, so it needs a name
({ label: "Due date", incompleteMessage: "Enter a complete date" }) satisfies DatePicker.RootProps;

const LoadedCalendar = lazy(() =>
  import("@abereghici/ui/calendar").then((module) => ({ default: module.Calendar })),
);

const meta = preview.meta({
  title: "Components/DatePicker",
  component: DatePicker.Root,
  subcomponents: partsOf(DatePicker),
  argTypes: dateFieldArgTypes,
  args: {
    label: "Due date",
    name: "due",
    defaultValue: date("2025-03-12"),
    triggerLabel: "Choose date",
    incompleteMessage: "Enter a complete date",
    onValueChange,
    onOpenChange,
    children: (
      <DatePicker.Content>
        <Calendar {...months} />
      </DatePicker.Content>
    ),
  },
  beforeEach: async () => {
    onOpenChange.mockClear();
    await parkPointer();
  },
  decorators: [
    withForm,
    (Story) => (
      <div style={{ maxInlineSize: "20rem", paddingBlockEnd: "24rem" }}>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({});

Default.test("has a trigger named Choose date that describes the value", async ({ canvas }) => {
  await expect(canvas.getByRole("group", { name: "Due date" })).toBeVisible();

  const trigger = canvas.getByRole("button", { name: "Choose date" });

  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await expect(trigger).toHaveAccessibleDescription("Wednesday, March 12, 2025");
});

Default.test(
  "formats the value and its Calendar in the app's locale",
  { globals: { locale: "ro-RO" } },
  async ({ canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Choose date" });

    await expect(trigger).toHaveAccessibleDescription("miercuri, 12 martie 2025");
    await user.click(trigger);
    await waitFor(() => expect(canvas.getByRole("grid", { name: "martie 2025" })).toBeVisible());
  },
);

Default.test("opens from the keyboard with focus on the selected day", async ({ canvas }) => {
  const user = await trusted();
  const trigger = canvas.getByRole("button", { name: "Choose date" });

  trigger.focus();
  await user.keyboard("{Enter}");
  await waitFor(() => expect(canvas.getByRole("dialog", { name: "Choose date" })).toBeVisible());
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toHaveAttribute("aria-controls", canvas.getByRole("dialog").id);
  await waitFor(() => expect(canvas.getByLabelText("Wednesday, March 12, 2025")).toHaveFocus());
});

Default.test(
  "keeps the panel on a cancelled day press, then chooses the day, closes and returns focus",
  async ({ args, canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Choose date" });

    await user.click(trigger);
    await waitFor(() => expect(canvas.getByLabelText("Wednesday, March 12, 2025")).toHaveFocus());
    onValueChange.mockImplementationOnce((_value, details) => {
      details.cancel();
    });
    await user.click(canvas.getByLabelText("Thursday, March 20, 2025"));
    await user.click(canvas.getByLabelText("Thursday, March 20, 2025"));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAccessibleDescription("Thursday, March 20, 2025");
    await expect(canvas.getByRole("spinbutton", { name: "day" })).toHaveValue("20");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      date("2025-03-20"),
      expect.objectContaining({ reason: "day-press" }),
    );
    await expect(reasons()).toEqual([
      [true, "trigger-press"],
      [false, "day-press"],
    ]);
  },
);

Default.test("chooses with Enter and with Space", async ({ canvas }) => {
  const user = await trusted();
  const trigger = canvas.getByRole("button", { name: "Choose date" });

  trigger.focus();

  for (const [key, day] of [
    ["{Enter}", "Thursday, March 13, 2025"],
    [" ", "Friday, March 14, 2025"],
  ] as const) {
    await user.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("dialog")).toBeVisible());
    await waitFor(() =>
      expect(canvas.getByRole("dialog").contains(document.activeElement)).toBe(true),
    );
    await user.keyboard(`{ArrowRight}${key}`);
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAccessibleDescription(day);
  }
});

Default.test(
  "closes on Escape with the value kept and dispatches ab-dismiss",
  async ({ args, canvas }) => {
    const user = await trusted();
    const dismissed = listen("ab-dismiss");
    const trigger = canvas.getByRole("button", { name: "Choose date" });

    await user.click(trigger);
    await waitFor(() => expect(canvas.getByRole("dialog")).toBeVisible());
    await user.keyboard("{ArrowRight}{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(dismissed.events.map((event) => event.detail.component)).toEqual(["Popover"]);
    dismissed.stop();
    await expect(reasons().flat()).toEqual([true, "trigger-press", false, "escape-key"]);
  },
);

Default.test("closes on a press outside", async ({ canvas }) => {
  const user = await trusted();

  await user.click(canvas.getByRole("button", { name: "Choose date" }));
  await waitFor(() => expect(canvas.getByRole("dialog")).toBeVisible());
  await user.click(document.body, { position: { x: 600, y: 20 } });
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await expect(canvas.getByRole("spinbutton", { name: "day" })).toHaveValue("12");
  await expect(reasons().at(-1)).toEqual([false, "outside-press"]);
});

Default.test("closes when Tab leaves the panel, on to the next control", async ({ canvas }) => {
  const user = await trusted();

  await user.click(canvas.getByRole("button", { name: "Choose date" }));
  await waitFor(() => expect(canvas.getByLabelText("Wednesday, March 12, 2025")).toHaveFocus());
  await user.keyboard("{Tab}");
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await expect(reasons().at(-1)).toEqual([false, "focus-out"]);
  await expect(canvas.getByRole("button", { name: "Save" })).toHaveFocus();
});

Default.test("closes when its trigger is pressed again", async ({ canvas }) => {
  const user = await trusted();
  const trigger = canvas.getByRole("button", { name: "Choose date" });

  await user.click(trigger);
  await waitFor(() => expect(canvas.getByRole("dialog")).toBeVisible());
  await user.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  await expect(reasons().flat()).toEqual([true, "trigger-press", false, "trigger-press"]);
});

Default.test(
  "focuses today when there is no value",
  { args: { defaultValue: null } },
  async ({ canvas }) => {
    const user = await trusted();

    await user.click(canvas.getByRole("button", { name: "Choose date" }));
    await waitFor(() => expect(document.activeElement).toHaveAttribute("aria-current", "date"));
  },
);

Default.test("does not open while disabled", { args: { disabled: true } }, async ({ canvas }) => {
  const user = await trusted();
  const trigger = canvas.getByRole("button", { name: "Choose date" });

  await expect(trigger).toHaveAttribute("aria-disabled", "true");
  trigger.focus();
  await user.keyboard("{Enter}");
  await expect(canvas.queryByRole("dialog")).toBeNull();
});

Default.test("submits the chosen day", async ({ canvas }) => {
  const user = await trusted();

  submitted.mockClear();
  await user.click(canvas.getByRole("button", { name: "Choose date" }));
  await user.click(await canvas.findByLabelText("Thursday, March 20, 2025"));
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await user.click(canvas.getByRole("button", { name: "Save" }));
  await expect(submitted.mock.calls[0]?.[0].get("due")).toBe("2025-03-20");
});

Default.test("returns to its default value when its form resets", async ({ canvas, userEvent }) => {
  const day = canvas.getByRole("spinbutton", { name: "day" });

  await userEvent.type(day, "20");
  await expect(day).toHaveValue("20");
  await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
  await expect(day).toHaveValue("12");
  submitted.mockClear();
  await userEvent.click(canvas.getByRole("button", { name: "Save" }));
  await expect(submitted.mock.calls[0]?.[0].get("due")).toBe("2025-03-12");
});

Default.test(
  "marks a typed unavailable date invalid after leaving the field",
  {
    args: {
      isDateUnavailable: (day: Temporal.PlainDate) => day.dayOfWeek > 5,
      unavailableMessage: "This date is not available",
    },
  },
  async ({ canvas }) => {
    const user = await trusted();

    await user.click(canvas.getByRole("spinbutton", { name: "day" }));
    await user.keyboard("15");
    await expect(canvas.queryByText("This date is not available")).toBeNull();
    await user.keyboard("{Tab}{Tab}");
    await expect(canvas.getByRole("button", { name: "Save" })).toHaveFocus();
    await expect(await canvas.findByText("This date is not available")).toBeVisible();
    await user.click(canvas.getByRole("button", { name: "Choose date" }));
    await expect(await canvas.findByLabelText("Saturday, March 15, 2025")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  },
);

Default.test(
  "blocks the submit of an unavailable default day and shows why",
  {
    args: {
      defaultValue: date("2025-03-15"),
      isDateUnavailable: (day: Temporal.PlainDate) => day.dayOfWeek > 5,
      unavailableMessage: "This date is not available",
    },
  },
  async ({ canvas, userEvent }) => {
    submitted.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(submitted).not.toHaveBeenCalled();
    await expect(await canvas.findByText("This date is not available")).toBeVisible();
    await expect(canvas.getByRole("spinbutton", { name: "day" })).toBeInvalid();
  },
);

export const LazyCalendar = meta.story({
  parameters: {
    docs: {
      description: { story: "The Calendar loads with `lazy()` on the first open." },
      source: {
        code: `import { lazy, Suspense } from "react";
import { DatePicker } from "@abereghici/ui/date-picker";

const Calendar = lazy(() =>
  import("@abereghici/ui/calendar").then((module) => ({ default: module.Calendar })),
);

<DatePicker.Root label="Due date" name="due" triggerLabel="Choose date" incompleteMessage="Enter a complete date">
  <DatePicker.Content>
    <Suspense>
      <Calendar previousMonthLabel="Previous month" nextMonthLabel="Next month" />
    </Suspense>
  </DatePicker.Content>
</DatePicker.Root>`,
      },
    },
  },
  args: {
    children: (
      <DatePicker.Content>
        <Suspense>
          <LoadedCalendar {...months} />
        </Suspense>
      </DatePicker.Content>
    ),
  },
});

LazyCalendar.test("focuses the selected day once the Calendar loads", async ({ canvas }) => {
  const user = await trusted();

  await user.click(canvas.getByRole("button", { name: "Choose date" }));
  await waitFor(() => expect(canvas.getByLabelText("Wednesday, March 12, 2025")).toHaveFocus());
});
