import { lazy, Suspense } from "react";
import { expect, fn, waitFor } from "storybook/test";
import { Temporal } from "temporal-polyfill";

import { Button } from "@platform/ui/button";
import { Calendar } from "@platform/ui/calendar";
import { roRO } from "@platform/ui/locales/ro-RO";

import preview from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import * as DatePicker from "./date-picker.tsx";

// @ts-expect-error -- a locale must name the DatePicker trigger and panel
({ tag: "fr-FR", labels: { ...roRO.labels, datePicker: {} } }) satisfies typeof roRO;

const date = (iso: string) => Temporal.PlainDate.from(iso);
const submitted = fn<(data: FormData) => void>();
const onOpenChange = fn<NonNullable<DatePicker.RootProps["onOpenChange"]>>();
const reasons = () => onOpenChange.mock.calls.map(([open, { reason }]) => [open, reason]);

const LazyCalendar = lazy(() =>
  import("@platform/ui/calendar").then((module) => ({ default: module.Calendar })),
);

const meta = preview.meta({
  title: "Components/Forms/DatePicker",
  component: DatePicker.Root,
  args: {
    label: "Due date",
    name: "due",
    defaultValue: date("2025-03-12"),
    onValueChange: fn<NonNullable<DatePicker.RootProps["onValueChange"]>>(),
    onOpenChange,
    children: (
      <DatePicker.Content>
        <Calendar />
      </DatePicker.Content>
    ),
  },
  beforeEach: () => {
    onOpenChange.mockClear();
  },
  decorators: [
    (Story) => (
      <div
        style={{ display: "grid", gap: "0.5rem", maxInlineSize: "20rem", paddingBlockEnd: "24rem" }}
      >
        <Story />
        <Button variant="tertiary">After</Button>
      </div>
    ),
  ],
});

export const Default = meta.story({});

Default.test("has a trigger named Choose date that describes the value", async ({ canvas }) => {
  await expect(canvas.getByRole("group", { name: "Due date" })).toBeVisible();
  const trigger = canvas.getByRole("button", { name: "Choose date" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await expect(trigger).toHaveAccessibleDescription("Wednesday, March 12, 2025");
});

Default.test("opens from the keyboard with focus on the selected day", async ({ canvas }) => {
  const user = await trusted();
  const trigger = canvas.getByRole("button", { name: "Choose date" });
  trigger.focus();
  await user.keyboard("{Enter}");
  await waitFor(() => expect(canvas.getByRole("dialog", { name: "Choose date" })).toBeVisible());
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await waitFor(() => expect(canvas.getByLabelText("Wednesday, March 12, 2025")).toHaveFocus());
});

Default.test(
  "chooses a clicked day, closes and returns focus to the trigger",
  async ({ args, canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Choose date" });
    await user.click(trigger);
    await waitFor(() => expect(canvas.getByLabelText("Wednesday, March 12, 2025")).toHaveFocus());
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
    await expect(reasons()).toEqual([
      [true, "trigger-press"],
      [false, "escape-key"],
    ]);
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

Default.test("closes when Tab leaves the panel", async ({ canvas }) => {
  const user = await trusted();
  await user.click(canvas.getByRole("button", { name: "Choose date" }));
  await waitFor(() => expect(canvas.getByLabelText("Wednesday, March 12, 2025")).toHaveFocus());
  await user.keyboard("{Tab}");
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await expect(reasons().at(-1)).toEqual([false, "focus-out"]);
});

Default.test("closes when its trigger is pressed again", async ({ canvas }) => {
  const user = await trusted();
  const pressed = listen("ab-press");
  const trigger = canvas.getByRole("button", { name: "Choose date" });
  await user.click(trigger);
  await waitFor(() => expect(canvas.getByRole("dialog")).toBeVisible());
  await user.click(trigger);
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(pressed.events.map((event) => event.detail.component)).toEqual([
    "IconButton",
    "IconButton",
  ]);
  pressed.stop();
});

Default.test(
  "focuses today when there is no value",
  { args: { defaultValue: null } },
  async ({ canvas }) => {
    const user = await trusted();
    const trigger = canvas.getByRole("button", { name: "Choose date" });
    await expect(trigger).not.toHaveAccessibleDescription();
    await user.click(trigger);
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

Default.test(
  "starts open with defaultOpen",
  { args: { defaultOpen: true } },
  async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole("dialog", { name: "Choose date" })).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Choose date" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
);

export const InAForm = meta.story({
  decorators: [
    (Story) => (
      <form
        aria-label="Booking"
        onSubmit={(event) => {
          event.preventDefault();
          submitted(new FormData(event.currentTarget));
        }}
      >
        <Story />
        <Button type="submit">Save</Button>
      </form>
    ),
  ],
  args: { required: true },
});

InAForm.test("submits the chosen day", async ({ canvas }) => {
  const user = await trusted();
  submitted.mockClear();
  await user.click(canvas.getByRole("button", { name: "Choose date" }));
  await user.click(await canvas.findByLabelText("Thursday, March 20, 2025"));
  await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  await user.click(canvas.getByRole("button", { name: "Save" }));
  await expect(submitted.mock.calls[0]?.[0].get("due")).toBe("2025-03-20");
});

InAForm.test(
  "marks a typed unavailable date invalid after leaving the field",
  { args: { isDateUnavailable: (day: Temporal.PlainDate) => day.dayOfWeek > 5 } },
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

export const LazyCalendarStory = meta.story({
  name: "Lazy calendar",
  parameters: {
    docs: { description: { story: "The Calendar loads with `lazy()` on the first open." } },
  },
  args: {
    children: (
      <DatePicker.Content>
        <Suspense>
          <LazyCalendar />
        </Suspense>
      </DatePicker.Content>
    ),
  },
});

LazyCalendarStory.test("focuses the selected day once the Calendar loads", async ({ canvas }) => {
  const user = await trusted();
  await user.click(canvas.getByRole("button", { name: "Choose date" }));
  await waitFor(() => expect(canvas.getByLabelText("Wednesday, March 12, 2025")).toHaveFocus());
});
